(() => {
  const config = window.law100SavioComments;
  const account = document.querySelector('[data-savio-account]');
  const dialog = document.querySelector('[data-savio-dialog]');
  const guestDialog = document.querySelector('[data-savio-guest-dialog]');
  const commentForm = document.querySelector('#commentform');
  if (!config || !account || !dialog || !guestDialog || !commentForm) return;

  const title = account.querySelector('[data-savio-account-title]');
  const openButton = account.querySelector('[data-savio-open]');
  const logoutButton = account.querySelector('[data-savio-logout]');
  const intent = commentForm.querySelector('[data-savio-intent]');
  const errorBox = dialog.querySelector('[data-savio-error]');
  const views = [...dialog.querySelectorAll('[data-savio-view]')];
  const loginForm = dialog.querySelector('[data-savio-view="login"]');
  const guestFields = ['.comment-form-author', '.comment-form-email', '.comment-form-cookies-consent']
    .map((selector) => commentForm.querySelector(selector))
    .filter(Boolean);
  const comment = commentForm.querySelector('#comment');
  const guestSubmit = guestDialog.querySelector('[data-savio-guest-submit]');
  const draftKey = `law100-comment-draft:${config.postId}`;
  let session = { authenticated: false };
  let challenge = null;
  let bypassSubmitCheck = false;

  guestFields.forEach((field) => {
    field.querySelectorAll('input').forEach((input) => input.setAttribute('form', commentForm.id));
    guestDialog.querySelector('[data-savio-guest-fields]').append(field);
  });

  const showError = (message = '') => {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  };

  const showView = (name) => {
    showError();
    loginForm.querySelector('[name="password"]').type = 'password';
    const passwordToggle = dialog.querySelector('[data-savio-password-toggle]');
    passwordToggle.setAttribute('aria-pressed', 'false');
    passwordToggle.setAttribute('aria-label', '显示密码');
    dialog.dataset.savioView = name;
    dialog.querySelector('[data-savio-dialog-title]').textContent = ({ login: '登录', register: '创建账号', forgot: '忘记密码', verify: '验证邮箱', reset: '重置密码', profile: '设置昵称' })[name] || 'Savio';
    dialog.querySelector('[data-savio-subtitle]').textContent = ({ login: '登录后评论无需等待审核', register: '注册并验证邮箱后，即可参与讨论', forgot: '输入注册邮箱，我们会发送验证码', verify: '输入邮件中的 6 位验证码', reset: '输入验证码并设置新密码', profile: '设置公开昵称后即可评论' })[name] || '';
    views.forEach((view) => { view.hidden = view.dataset.savioView !== name; });
    const first = dialog.querySelector(`[data-savio-view="${name}"] input`);
    window.setTimeout(() => first?.focus(), 30);
  };

  const api = async (path, body, csrf = '') => {
    const options = { credentials: 'same-origin', headers: {} };
    if (body !== undefined) {
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    if (csrf) options.headers['X-Savio-CSRF'] = csrf;
    const response = await fetch(`${config.apiBase}${path}`, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const failure = new Error(payload?.error?.message || '请求失败，请稍后再试。');
      failure.code = payload?.error?.code;
      failure.details = payload?.error?.details || {};
      throw failure;
    }
    return payload.data || {};
  };

  const setGuestFields = (hidden) => {
    guestFields.forEach((field) => {
      field.hidden = hidden;
      field.querySelectorAll('input').forEach((input) => {
        if (!input.dataset.savioRequired) input.dataset.savioRequired = input.required ? '1' : '0';
        input.disabled = hidden || !guestDialog.open;
        input.required = !hidden && input.dataset.savioRequired === '1';
      });
    });
  };

  const renderSession = () => {
    const ready = session.authenticated && session.emailVerified && session.profileComplete;
    if (ready && guestDialog.open) guestDialog.close();
    intent.value = ready ? '1' : '0';
    setGuestFields(ready);
    logoutButton.hidden = !session.authenticated;
    if (ready) {
      title.textContent = `${session.displayName} · 已验证`;
      openButton.hidden = true;
      return;
    }
    openButton.hidden = false;
    if (session.authenticated) {
      if (!session.emailVerified) {
        title.textContent = '邮箱尚未验证';
        openButton.textContent = '重新登录并验证';
        return;
      }
      title.textContent = '还差一个公开昵称';
      openButton.textContent = '设置昵称';
      return;
    }
    title.textContent = '游客首次留言可能需要审核 · 登录后可直接发布';
    openButton.textContent = '登录';
  };

  const refreshSession = async () => {
    try {
      session = await api('/auth/session');
    } catch (_) {
      session = { authenticated: false };
    }
    renderSession();
    return session;
  };

  const openDialog = (viewName = '') => {
    if (!dialog.open) dialog.showModal();
    showView(viewName || (session.authenticated && session.emailVerified && !session.profileComplete ? 'profile' : 'login'));
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
    openButton.focus();
  };

  const finishAuthentication = (data) => {
    session = data;
    renderSession();
    if (session.profileComplete) {
      dialog.close();
      comment?.focus();
    } else {
      showView('profile');
    }
  };

  const submit = (viewName, handler) => {
    const form = dialog.querySelector(`[data-savio-view="${viewName}"]`);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      showError();
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      try {
        await handler(new FormData(form));
      } catch (error) {
        showError(error.message);
      } finally {
        button.disabled = false;
      }
    });
  };

  submit('login', async (form) => {
    const identifier = String(form.get('identifier') ?? form.get('email') ?? '').trim();
    if (!identifier.includes('@') && !/^[A-Za-z0-9]{2,24}$/.test(identifier)) {
      throw new Error('用户名仅支持 2–24 位英文字母和数字；其他昵称请使用邮箱登录。');
    }
    try {
      finishAuthentication(await api('/auth/login', {
        identifier,
        password: form.get('password'),
        rememberMe: form.has('rememberMe'),
        locale: 'zh-CN',
      }));
    } catch (error) {
      if (error.code === 'email_verification_required' && error.details.challengeId) {
        challenge = { ...error.details, purpose: 'verify_email', rememberMe: form.has('rememberMe') };
        dialog.querySelector('[data-savio-verify-copy]').textContent = `验证码已发送至 ${challenge.maskedEmail || '你的邮箱'}。`;
        showView('verify');
        return;
      }
      throw error;
    }
  });

  submit('register', async (form) => {
    const data = await api('/auth/register', {
      displayName: form.get('displayName'),
      email: form.get('email'),
      password: form.get('password'),
      locale: 'zh-CN',
    });
    challenge = { ...data, purpose: 'verify_email' };
    dialog.querySelector('[data-savio-verify-copy]').textContent = `验证码已发送至 ${challenge.maskedEmail || '你的邮箱'}。`;
    showView('verify');
  });

  submit('verify', async (form) => {
    if (!challenge?.challengeId) throw new Error('验证请求已过期，请重新登录。');
    finishAuthentication(await api('/auth/email/verify', {
      challengeId: challenge.challengeId,
      code: form.get('code'),
      rememberMe: challenge.rememberMe !== false,
      locale: 'zh-CN',
    }));
  });

  submit('forgot', async (form) => {
    const data = await api('/auth/password/forgot', { email: form.get('email'), locale: 'zh-CN' });
    challenge = { ...data, purpose: 'reset_password' };
    showView('reset');
  });

  submit('reset', async (form) => {
    if (!challenge?.challengeId) throw new Error('验证请求已过期，请重新操作。');
    finishAuthentication(await api('/auth/password/reset', {
      challengeId: challenge.challengeId,
      code: form.get('code'),
      newPassword: form.get('newPassword'),
      locale: 'zh-CN',
    }));
  });

  submit('profile', async (form) => {
    finishAuthentication(await api('/profile', { displayName: form.get('displayName') }, session.csrfToken));
  });

  dialog.querySelector('[data-savio-password-toggle]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const password = loginForm.querySelector('[name="password"]');
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
    password.focus();
  });
  dialog.querySelectorAll('[data-savio-show]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.savioShow)));
  dialog.querySelector('[data-savio-close]').addEventListener('click', closeDialog);
  guestDialog.querySelector('[data-savio-guest-close]').addEventListener('click', () => guestDialog.close());
  guestDialog.querySelector('[data-savio-guest-login]').addEventListener('click', () => {
    guestDialog.close();
    openDialog();
  });
  guestDialog.addEventListener('close', () => setGuestFields(false));
  guestDialog.addEventListener('click', (event) => {
    if (event.target !== guestDialog) return;
    const rect = guestDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) guestDialog.close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) closeDialog();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault();
      closeDialog();
    }
  });
  openButton.addEventListener('click', () => {
    if (comment) sessionStorage.setItem(draftKey, comment.value);
    openDialog();
  });
  logoutButton.addEventListener('click', async () => {
    try {
      await api('/auth/logout', {}, session.csrfToken);
    } finally {
      session = { authenticated: false };
      renderSession();
    }
  });
  dialog.querySelector('[data-savio-resend]').addEventListener('click', async () => {
    if (!challenge?.challengeId) return showError('验证请求已过期，请重新操作。');
    try {
      const data = await api('/auth/email/resend', { challengeId: challenge.challengeId, locale: 'zh-CN' });
      challenge = { ...challenge, ...data };
      showError('验证码已重新发送。');
    } catch (error) {
      showError(error.message);
    }
  });

  if (comment) {
    const saved = sessionStorage.getItem(draftKey);
    if (saved && !comment.value) comment.value = saved;
    comment.addEventListener('input', () => sessionStorage.setItem(draftKey, comment.value));
    if (location.hash.startsWith('#comment-') || new URLSearchParams(location.search).has('unapproved')) {
      sessionStorage.removeItem(draftKey);
    }
  }

  commentForm.addEventListener('submit', async (event) => {
    if (bypassSubmitCheck) return;
    event.preventDefault();
    if (comment) sessionStorage.setItem(draftKey, comment.value);
    if (guestDialog.open && intent.value === '0') {
      bypassSubmitCheck = true;
      commentForm.requestSubmit(guestSubmit);
      return;
    }
    if (intent.value !== '1') {
      if (session.authenticated) {
        openDialog(session.emailVerified ? 'profile' : 'login');
        return;
      }
      guestDialog.showModal();
      setGuestFields(false);
      guestFields[0]?.querySelector('input')?.focus();
      return;
    }
    const checked = await refreshSession();
    if (!checked.authenticated || !checked.profileComplete) {
      openDialog(checked.authenticated ? 'profile' : 'login');
      showError('登录状态已失效，请重新确认后发布。');
      return;
    }
    bypassSubmitCheck = true;
    commentForm.requestSubmit(event.submitter || undefined);
  });

  refreshSession();
})();
