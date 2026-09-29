const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');

// Exercise the actual login callback without adding a DOM library.
const script = readFileSync(require.resolve('../assets/comments.js'), 'utf8');
const login = script.slice(script.indexOf("  submit('login'"), script.indexOf("  submit('register'"));
const template = readFileSync(require.resolve('../law100-savio-comments.php'), 'utf8');
function harness() {
  let handler;
  const calls = [];
  runInNewContext(login, {
    submit: (_, callback) => { handler = callback; },
    api: async (path, body) => { calls.push({ path, body }); return {}; },
    finishAuthentication: () => {},
  });
  return { handler, calls };
}
test('login accepts trimmed ASCII nicknames or emails without changing passwords', async () => {
  for (const input of ['law101', 'Alice', '1234', 'Ab', 'a'.repeat(24), ' User7 ', '\u3000User7\u3000', 'Mail@example.test']) {
    const { handler, calls } = harness();
    await handler(new Map([['identifier', input], ['password', ' password unchanged ']]));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].body.identifier, input.trim());
    assert.equal(calls[0].body.password, ' password unchanged ');
    assert.equal(calls[0].path, '/auth/login');
    assert.equal('email' in calls[0].body, false);
  }
});
test('invalid nicknames never reach the login API', async () => {
  for (const input of ['', ' ', 'a', 'a'.repeat(25), '中文', 'law中文', 'law 101', 'law_101', 'law-101', 'ｌａｗ１０１', 'Café', 'law\n101']) {
    const { handler, calls } = harness();
    await assert.rejects(handler(new Map([['identifier', input], ['password', 'test-only-password']])), /2–24/);
    assert.equal(calls.length, 0);
  }
});
test('remember-me choice reaches only the web login request', async () => {
  for (const checked of [true, false]) {
    const { handler, calls } = harness();
    const fields = new Map([['identifier', 'Alice'], ['password', 'test-only-password']]);
    if (checked) fields.set('rememberMe', 'on');
    await handler(fields);
    assert.equal(calls[0].body.rememberMe, checked);
  }
});
test('new script still accepts the legacy email field in an already-open page', async () => {
  const { handler, calls } = harness();
  await handler(new Map([['email', 'old@example.test'], ['password', 'test-only-password']]));
  assert.equal(calls[0].body.identifier, 'old@example.test');
});
test('only login changes field semantics; register and reset remain email inputs', () => {
  const loginForm = template.match(/data-savio-view="login">([\s\S]*?)<\/form>/)[1];
  assert.match(loginForm, /邮箱\/用户名/);
  assert.match(loginForm, /name="identifier" type="text" autocomplete="username"/);
  for (const view of ['register', 'forgot']) {
    const form = template.match(new RegExp(`data-savio-view="${view}"[^>]*>([\\s\\S]*?)<\\/form>`))[1];
    assert.match(form, /name="email" type="email" autocomplete="email"/);
  }
});

test('registration and recovery use the shared auth layout without the old login tabs', () => {
  assert.doesNotMatch(template, /data-savio-tabs|data-savio-tab=/);
  assert.match(template, /data-savio-subtitle/);
  assert.match(script, /\[data-savio-subtitle\]/);
  for (const view of ['register', 'verify', 'forgot', 'reset', 'profile']) {
    const form = template.match(new RegExp(`data-savio-view="${view}"[^>]*>([\\s\\S]*?)<\\/form>`))[1];
    assert.match(form, /class="savio-login-field"/);
    assert.match(form, /class="savio-auth-primary"/);
  }
  for (const view of ['register', 'forgot', 'reset']) {
    const form = template.match(new RegExp(`data-savio-view="${view}"[^>]*>([\\s\\S]*?)<\\/form>`))[1];
    assert.match(form, /data-savio-show="login"/);
  }
});

test('dialog resizing during an internal click does not dismiss it as backdrop', () => {
  const listener = script.slice(script.indexOf("  dialog.addEventListener('click'"), script.indexOf("  document.addEventListener('keydown'"));
  let click;
  let closed = 0;
  const dialog = {
    addEventListener: (_, callback) => { click = callback; },
    getBoundingClientRect: () => ({ left: 100, right: 500, top: 100, bottom: 400 }),
  };
  runInNewContext(listener, { dialog, closeDialog: () => { closed++; } });
  click({ target: {}, clientX: 300, clientY: 600 });
  assert.equal(closed, 0);
  click({ target: {}, clientX: 0, clientY: 0 });
  assert.equal(closed, 0);
  click({ target: dialog, clientX: 300, clientY: 300 });
  assert.equal(closed, 0);
  click({ target: dialog, clientX: 300, clientY: 600 });
  assert.equal(closed, 1);
});

test('guest writes first, then confirms identity through the existing WordPress form', async () => {
  const code = script.slice(script.indexOf("  commentForm.addEventListener('submit'"), script.indexOf('\n  refreshSession();', script.indexOf("  commentForm.addEventListener('submit'")));
  let submit;
  let posted = 0;
  let focused = 0;
  const guestSubmit = {};
  const guestDialog = { open: false, showModal() { this.open = true; } };
  const context = {
    bypassSubmitCheck: false,
    comment: { value: 'A draft' },
    draftKey: 'draft',
    sessionStorage: { setItem: (_, text) => assert.equal(text, 'A draft') },
    intent: { value: '0' },
    session: { authenticated: false },
    guestDialog,
    guestSubmit,
    guestFields: [{ querySelector: () => ({ focus: () => { focused++; } }) }],
    setGuestFields: (hidden) => assert.equal(hidden, false),
    commentForm: {
      addEventListener: (_, callback) => { submit = callback; },
      requestSubmit: (button) => { assert.equal(button, guestSubmit); posted++; submit({ submitter: button, preventDefault() {} }); },
    },
  };
  runInNewContext(code, context);
  await submit({ submitter: {}, preventDefault() {} });
  assert.equal(guestDialog.open, true);
  assert.equal(focused, 1);
  assert.equal(posted, 0);
  await submit({ submitter: guestSubmit, preventDefault() {} });
  assert.equal(posted, 1);
  assert.equal(context.bypassSubmitCheck, true);
  assert.match(template, /form="commentform"[^>]*data-savio-guest-submit/);
  let view;
  context.bypassSubmitCheck = false;
  guestDialog.open = false;
  context.session = { authenticated: true, emailVerified: false };
  context.openDialog = (name) => { view = name; };
  await submit({ submitter: {}, preventDefault() {} });
  assert.equal(view, 'login');
  assert.equal(guestDialog.open, false);
});
