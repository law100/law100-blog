<?php
/**
 * 主题头部模板 — 全站统一顶栏
 * 左侧网站名 + 右侧导航/搜索，与首页 hero 顶栏风格一致
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php if ( ! is_page( 'drive' ) ) : ?>
	<script id="law100-appearance-init"><?php require LIQUIDGLASS_THEME_DIR . '/assets/js/appearance.js'; ?></script>
	<?php endif; ?>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
	<?php if ( is_front_page() && is_home() ) : ?>
		<?php $home_landscape = 'background-image: url("' . esc_url( liquidglass_hero_image_url() ) . '");'; ?>
		<div class="home-landscape" style="<?php echo esc_attr( $home_landscape ); ?>" aria-hidden="true"></div>
	<?php endif; ?>
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( '跳至内容', 'liquidglass' ); ?></a>

	<header id="masthead" class="site-header">
		<div class="header-inner">
			<div class="header-brand">
				<?php if ( has_custom_logo() ) : ?>
					<div class="header-logo"><?php the_custom_logo(); ?></div>
				<?php endif; ?>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="header-name">
					<?php bloginfo( 'name' ); ?>
				</a>
				<?php
				$description = get_bloginfo( 'description', 'display' );
				if ( $description ) : ?>
					<span class="header-desc"><?php echo esc_html( $description ); ?></span>
				<?php endif; ?>
			</div>

			<nav id="site-navigation" class="main-navigation" aria-label="<?php esc_attr_e( '主导航', 'liquidglass' ); ?>">
				<ul id="primary-menu" class="nav-menu">
					<?php get_template_part( 'template-parts/nav-links' ); ?>
				</ul>
			</nav><!-- #site-navigation -->

			<?php get_template_part( 'template-parts/appearance-toggle' ); ?>
			<div class="header-search">
					<button class="header-search-toggle" type="button" aria-label="<?php esc_attr_e( '搜索', 'liquidglass' ); ?>" aria-expanded="false" aria-controls="header-search-form">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
				</button>
				<form id="header-search-form" class="header-search-form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" aria-hidden="true">
					<label class="screen-reader-text" for="header-search-input"><?php esc_html_e( '搜索文章', 'liquidglass' ); ?></label>
					<input id="header-search-input" type="search" name="s" class="header-search-input" placeholder="<?php esc_attr_e( '输入关键词搜索...', 'liquidglass' ); ?>" autocomplete="off">
				</form>
			</div>
		</div>
	</header><!-- #masthead -->

	<div id="content" class="site-content">
