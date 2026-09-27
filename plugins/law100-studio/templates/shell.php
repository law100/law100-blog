<!doctype html>
<html lang="zh-CN">
<head>
	<meta charset="<?php echo esc_attr( get_bloginfo( 'charset' ) ); ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
	<meta name="color-scheme" content="light">
	<title>law100 内容工作台</title>
	<?php foreach ( $assets['css'] as $style_url ) : ?>
		<link rel="stylesheet" href="<?php echo esc_url( $style_url ); ?>">
	<?php endforeach; ?>
</head>
<body class="studio-body">
	<div id="law100-studio"
		data-rest-root="<?php echo esc_attr( $studio_config['restRoot'] ); ?>"
		data-rest-nonce="<?php echo esc_attr( $studio_config['nonce'] ); ?>"
		data-home-url="<?php echo esc_attr( $studio_config['homeUrl'] ); ?>"
		data-drive-url="<?php echo esc_attr( $studio_config['driveUrl'] ); ?>"
		data-studio-url="<?php echo esc_attr( $studio_config['studioUrl'] ); ?>"></div>
	<script type="module" src="<?php echo esc_url( $assets['js'] ); ?>"></script>
</body>
</html>
