<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="<?php echo esc_attr( get_bloginfo( 'charset' ) ); ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
	<meta name="color-scheme" content="light">
	<title>登录 · law100 Studio</title>
	<?php foreach ( $assets['css'] as $style_url ) : ?>
		<link rel="stylesheet" href="<?php echo esc_url( $style_url ); ?>">
	<?php endforeach; ?>
</head>
<body class="studio-login-body">
	<main class="studio-login" aria-labelledby="studio-login-title">
		<h1 id="studio-login-title" class="studio-login-heading"><img class="studio-login-logo" src="<?php echo esc_url( $assets['logo'] ); ?>" width="1320" height="261" alt="law100’s Studio"></h1>
		<?php if ( $login_error ) : ?>
			<p class="studio-login-error" role="alert"><?php echo esc_html( $login_error ); ?></p>
		<?php endif; ?>
		<form method="post" action="<?php echo esc_url( home_url( '/studio/login/' ) ); ?>" class="studio-login-form">
			<?php wp_nonce_field( 'law100_studio_login', 'law100_studio_login_nonce' ); ?>
			<label for="studio-user">用户名</label>
			<input id="studio-user" name="log" type="text" autocomplete="username" required>
			<label for="studio-password">密码</label>
			<input id="studio-password" name="pwd" type="password" autocomplete="current-password" required>
			<label class="studio-login-remember"><input name="rememberme" type="checkbox" value="forever"><span>在这台设备上保持登录</span></label>
			<button type="submit">进入 Studio</button>
		</form>
		<a class="studio-login-help" href="<?php echo esc_url( wp_lostpassword_url( home_url( '/studio/' ) ) ); ?>">忘记密码</a>
	</main>
</body>
</html>
