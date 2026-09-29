<?php
/**
 * Plugin Name: law100 Savio Comments
 * Description: Uses verified Savio identities for trusted blog comments while preserving guest comments.
 * Version: 1.0.0
 * Author: law100
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * Requires PHP: 8.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const LAW100_SAVIO_COOKIE = 'savio_blog_session';
const LAW100_SAVIO_API_BASE = '/api/savio/v1/web';

// Guest comments work without the optional identity bridge.
function law100_savio_is_configured(): bool {
	return defined( 'LAW100_SAVIO_BRIDGE_SECRET' ) && strlen( (string) LAW100_SAVIO_BRIDGE_SECRET ) >= 32;
}

function law100_savio_asset_version( string $path ): string {
	$file = plugin_dir_path( __FILE__ ) . ltrim( $path, '/' );
	return is_file( $file ) ? (string) filemtime( $file ) : '1.0.0';
}

function law100_savio_enqueue_assets(): void {
	if ( ! law100_savio_is_configured() || ! is_singular() || ! comments_open() || is_user_logged_in() ) {
		return;
	}
	wp_enqueue_style(
		'law100-savio-comments',
		plugins_url( 'assets/comments.css', __FILE__ ),
		[],
		law100_savio_asset_version( 'assets/comments.css' )
	);
	wp_enqueue_script(
		'law100-savio-comments',
		plugins_url( 'assets/comments.js', __FILE__ ),
		[],
		law100_savio_asset_version( 'assets/comments.js' ),
		true
	);
	wp_localize_script( 'law100-savio-comments', 'law100SavioComments', [
		'apiBase' => home_url( LAW100_SAVIO_API_BASE ),
		'postId' => get_queried_object_id(),
	] );
}
add_action( 'wp_enqueue_scripts', 'law100_savio_enqueue_assets' );

function law100_savio_comment_account(): void {
	if ( ! law100_savio_is_configured() || is_user_logged_in() ) {
		return;
	}
	?>
	<div class="savio-comment-account" data-savio-account>
		<div class="savio-comment-account__identity">
			<img src="<?php echo esc_url( plugins_url( 'assets/savio-mark.svg', __FILE__ ) ); ?>" alt="" width="36" height="36" aria-hidden="true">
			<span>
				<strong data-savio-account-title><?php esc_html_e( '游客留言', 'law100-savio-comments' ); ?></strong>
				<small data-savio-account-detail><?php esc_html_e( '登录 Savio 后，评论无需等待审核。', 'law100-savio-comments' ); ?></small>
			</span>
		</div>
		<div class="savio-comment-account__actions">
			<button type="button" class="savio-text-action" data-savio-open><?php esc_html_e( '使用 Savio 登录', 'law100-savio-comments' ); ?></button>
			<button type="button" class="savio-text-action" data-savio-logout hidden><?php esc_html_e( '退出', 'law100-savio-comments' ); ?></button>
		</div>
	</div>
	<input type="hidden" name="law100_savio_intent" value="0" data-savio-intent>
	<?php
}
add_action( 'comment_form_top', 'law100_savio_comment_account' );

function law100_savio_auth_dialog(): void {
	if ( ! law100_savio_is_configured() || is_user_logged_in() ) {
		return;
	}
	?>
	<dialog class="savio-auth-dialog" data-savio-dialog aria-labelledby="savio-dialog-title">
		<div class="savio-auth-shell">
			<header class="savio-auth-header">
				<div>
					<span class="savio-auth-kicker">Savio</span>
					<h3 id="savio-dialog-title" data-savio-dialog-title><?php esc_html_e( '欢迎回来', 'law100-savio-comments' ); ?></h3>
					<p class="savio-auth-subtitle" data-savio-login-subtitle><?php esc_html_e( '登录后即可参与讨论与分享', 'law100-savio-comments' ); ?></p>
				</div>
				<button type="button" class="savio-auth-close" data-savio-close aria-label="<?php esc_attr_e( '关闭', 'law100-savio-comments' ); ?>">×</button>
			</header>

			<div class="savio-auth-tabs" role="tablist" data-savio-tabs>
				<button type="button" role="tab" aria-selected="true" data-savio-tab="login"><?php esc_html_e( '登录', 'law100-savio-comments' ); ?></button>
				<button type="button" role="tab" aria-selected="false" data-savio-tab="register"><?php esc_html_e( '注册', 'law100-savio-comments' ); ?></button>
			</div>

			<p class="savio-auth-error" data-savio-error role="alert" hidden></p>

			<form class="savio-auth-form" data-savio-view="login">
				<div class="savio-login-field">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>
					<label class="screen-reader-text" for="savio-login-identifier"><?php esc_html_e( '邮箱/用户名', 'law100-savio-comments' ); ?></label>
					<input id="savio-login-identifier" name="identifier" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="<?php esc_attr_e( '邮箱/用户名', 'law100-savio-comments' ); ?>" aria-describedby="savio-login-identifier-help" required>
				</div>
				<small id="savio-login-identifier-help" class="screen-reader-text"><?php esc_html_e( '用户名仅支持 2 至 24 位英文字母和数字；中文昵称请用邮箱登录。', 'law100-savio-comments' ); ?></small>
				<div class="savio-login-field">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/></svg>
					<label class="screen-reader-text" for="savio-login-password"><?php esc_html_e( '密码', 'law100-savio-comments' ); ?></label>
					<input id="savio-login-password" name="password" type="password" autocomplete="current-password" minlength="8" placeholder="<?php esc_attr_e( '密码', 'law100-savio-comments' ); ?>" required>
					<button class="savio-password-toggle" type="button" data-savio-password-toggle aria-label="<?php esc_attr_e( '显示密码', 'law100-savio-comments' ); ?>" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path data-savio-eye-slash d="M3 21 21 3"/></svg></button>
				</div>
				<div class="savio-login-options">
					<label><input name="rememberMe" type="checkbox" checked><?php esc_html_e( '记住我', 'law100-savio-comments' ); ?></label>
					<button class="savio-auth-link" type="button" data-savio-show="forgot"><?php esc_html_e( '忘记密码？', 'law100-savio-comments' ); ?></button>
				</div>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '登 录', 'law100-savio-comments' ); ?><span aria-hidden="true">→</span></button>
				<div class="savio-login-register"><span><?php esc_html_e( '还没有账号？', 'law100-savio-comments' ); ?></span><button class="savio-auth-link" type="button" data-savio-show="register"><?php esc_html_e( '立即注册', 'law100-savio-comments' ); ?></button></div>
			</form>

			<form class="savio-auth-form" data-savio-view="register" hidden>
				<label><?php esc_html_e( '公开昵称', 'law100-savio-comments' ); ?><input name="displayName" type="text" autocomplete="nickname" minlength="2" maxlength="24" required><small><?php esc_html_e( '会显示在评论旁，不公开邮箱。', 'law100-savio-comments' ); ?></small></label>
				<label><?php esc_html_e( '邮箱', 'law100-savio-comments' ); ?><input name="email" type="email" autocomplete="email" required></label>
				<label><?php esc_html_e( '密码', 'law100-savio-comments' ); ?><input name="password" type="password" autocomplete="new-password" minlength="8" required><small><?php esc_html_e( '至少 8 个字符。', 'law100-savio-comments' ); ?></small></label>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '注册并验证邮箱', 'law100-savio-comments' ); ?></button>
			</form>

			<form class="savio-auth-form" data-savio-view="verify" hidden>
				<p class="savio-auth-copy" data-savio-verify-copy><?php esc_html_e( '输入邮件中的 6 位验证码。', 'law100-savio-comments' ); ?></p>
				<label><?php esc_html_e( '验证码', 'law100-savio-comments' ); ?><input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required></label>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '完成验证', 'law100-savio-comments' ); ?></button>
				<button class="savio-auth-link" type="button" data-savio-resend><?php esc_html_e( '重新发送验证码', 'law100-savio-comments' ); ?></button>
			</form>

			<form class="savio-auth-form" data-savio-view="forgot" hidden>
				<p class="savio-auth-copy"><?php esc_html_e( '我们会向你的 Savio 邮箱发送验证码。', 'law100-savio-comments' ); ?></p>
				<label><?php esc_html_e( '邮箱', 'law100-savio-comments' ); ?><input name="email" type="email" autocomplete="email" required></label>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '发送验证码', 'law100-savio-comments' ); ?></button>
				<button class="savio-auth-link" type="button" data-savio-show="login"><?php esc_html_e( '返回登录', 'law100-savio-comments' ); ?></button>
			</form>

			<form class="savio-auth-form" data-savio-view="reset" hidden>
				<label><?php esc_html_e( '验证码', 'law100-savio-comments' ); ?><input name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required></label>
				<label><?php esc_html_e( '新密码', 'law100-savio-comments' ); ?><input name="newPassword" type="password" autocomplete="new-password" minlength="8" required></label>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '重置并登录', 'law100-savio-comments' ); ?></button>
			</form>

			<form class="savio-auth-form" data-savio-view="profile" hidden>
				<p class="savio-auth-copy"><?php esc_html_e( '设置一个公开昵称后即可评论。', 'law100-savio-comments' ); ?></p>
				<label><?php esc_html_e( '公开昵称', 'law100-savio-comments' ); ?><input name="displayName" type="text" autocomplete="nickname" minlength="2" maxlength="24" required></label>
				<button class="savio-auth-primary" type="submit"><?php esc_html_e( '保存昵称', 'law100-savio-comments' ); ?></button>
			</form>
		</div>
	</dialog>
	<?php
}
add_action( 'comment_form_after', 'law100_savio_auth_dialog' );

function law100_savio_bridge_identity(): array|WP_Error {
	$token = $_COOKIE[ LAW100_SAVIO_COOKIE ] ?? null;
	if ( ! is_string( $token ) || ! preg_match( '/^[A-Za-z0-9_\-]{32,128}$/', $token ) ) {
		return new WP_Error( 'savio_session_missing', '登录状态已失效，请重新登录。' );
	}
	if ( ! defined( 'LAW100_SAVIO_BRIDGE_SECRET' ) || strlen( (string) LAW100_SAVIO_BRIDGE_SECRET ) < 32 ) {
		return new WP_Error( 'savio_bridge_unavailable', '评论身份服务暂时不可用。' );
	}
	$response = wp_remote_post( home_url( LAW100_SAVIO_API_BASE . '/auth/introspect' ), [
		'timeout' => 4,
		'reject_unsafe_urls' => true,
		'headers' => [
			'Content-Type' => 'application/json',
			'X-Savio-Bridge-Key' => (string) LAW100_SAVIO_BRIDGE_SECRET,
		],
		'body' => wp_json_encode( [ 'sessionToken' => $token ] ),
	] );
	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'savio_bridge_unavailable', '评论身份服务暂时不可用，请稍后再试。' );
	}
	$payload = json_decode( wp_remote_retrieve_body( $response ), true );
	$identity = is_array( $payload ) ? ( $payload['data'] ?? null ) : null;
	if ( 200 !== wp_remote_retrieve_response_code( $response ) || ! is_array( $identity ) || empty( $identity['authenticated'] ) ) {
		return new WP_Error( 'savio_session_invalid', '登录状态已失效，请重新登录。' );
	}
	if ( empty( $identity['emailVerified'] ) || empty( $identity['profileComplete'] ) || ! is_string( $identity['displayName'] ?? null ) ) {
		return new WP_Error( 'savio_profile_incomplete', '请先完成邮箱验证和公开昵称设置。' );
	}
	return $identity;
}

function law100_savio_prime_comment_request(): void {
	if (
		'POST' !== ( $_SERVER['REQUEST_METHOD'] ?? '' )
		|| 'wp-comments-post.php' !== basename( (string) ( $_SERVER['SCRIPT_FILENAME'] ?? '' ) )
		|| is_user_logged_in()
		|| '1' !== ( $_POST['law100_savio_intent'] ?? '' )
	) {
		return;
	}

	$identity = law100_savio_bridge_identity();
	if ( is_wp_error( $identity ) ) {
		wp_die( esc_html( $identity->get_error_message() ), 'Savio 登录已失效', [ 'response' => 401, 'back_link' => true ] );
	}

	$GLOBALS['law100_savio_comment_identity'] = $identity;
	$_POST['author'] = wp_slash( sanitize_text_field( $identity['displayName'] ) );
	$_POST['email']  = wp_slash( sanitize_email( $identity['email'] ) );
	$_POST['url']    = '';
}
add_action( 'init', 'law100_savio_prime_comment_request', 1 );

function law100_savio_prepare_comment( array $commentdata ): array {
	if ( is_user_logged_in() || '1' !== ( $_POST['law100_savio_intent'] ?? '' ) || ! empty( $commentdata['comment_type'] ) ) {
		return $commentdata;
	}
	$identity = $GLOBALS['law100_savio_comment_identity'] ?? law100_savio_bridge_identity();
	if ( is_wp_error( $identity ) ) {
		wp_die( esc_html( $identity->get_error_message() ), 'Savio 登录已失效', [ 'response' => 401, 'back_link' => true ] );
	}
	$GLOBALS['law100_savio_comment_identity'] = $identity;
	$recent = get_comments( [
		'count' => true,
		'date_query' => [ [
			'after' => gmdate( 'Y-m-d H:i:s', time() - 600 ),
			'inclusive' => true,
			'column' => 'comment_date_gmt',
		] ],
		'meta_key' => '_law100_savio_user_id',
		'meta_value' => $identity['userId'],
		'status' => 'all',
	] );
	if ( (int) $recent >= 5 ) {
		wp_die( '留言过于频繁，请十分钟后再试。', '留言过于频繁', [ 'response' => 429, 'back_link' => true ] );
	}
	$commentdata['comment_author'] = sanitize_text_field( $identity['displayName'] );
	$commentdata['comment_author_email'] = sanitize_email( $identity['email'] );
	$commentdata['comment_author_url'] = '';
	$commentdata['user_ID'] = 0;
	$GLOBALS['law100_savio_comment_identity'] = $identity;
	return $commentdata;
}
add_filter( 'preprocess_comment', 'law100_savio_prepare_comment' );

function law100_savio_approve_verified_comment( $approved, array $commentdata ) {
	if ( empty( $GLOBALS['law100_savio_comment_identity'] ) || in_array( $approved, [ 'spam', 'trash', 'post-trashed' ], true ) ) {
		return $approved;
	}
	return 1;
}
add_filter( 'pre_comment_approved', 'law100_savio_approve_verified_comment', 99, 2 );

function law100_savio_store_comment_identity( int $commentId ): void {
	$identity = $GLOBALS['law100_savio_comment_identity'] ?? null;
	if ( ! is_array( $identity ) ) {
		return;
	}
	add_comment_meta( $commentId, '_law100_savio_user_id', sanitize_text_field( $identity['userId'] ), true );
	add_comment_meta( $commentId, '_law100_savio_verified', '1', true );
	unset( $GLOBALS['law100_savio_comment_identity'] );
}
add_action( 'comment_post', 'law100_savio_store_comment_identity' );
