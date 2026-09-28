<?php
/**
 * 模板部件：首页英雄区域 — 全屏风景图
 * 顶部：网站名（左）+ 导航菜单（右），浮动于图片上方（同行）
 * 底部：液态玻璃「浏览文章 ↓」按钮
 */
$hero_image = liquidglass_hero_image_url();
$hero_media_style = $hero_image ? 'background-image: url("' . esc_url( $hero_image ) . '");' : '';
$hero_message = '永远相信美好的事情即将发生';
?>
<section class="site-hero">
	<div
		class="hero-media"
		style="<?php echo esc_attr( $hero_media_style ); ?>"
		data-hero-image="<?php echo esc_url( $hero_image ); ?>"
		aria-hidden="true"
	></div>
	<div class="hero-overlay"></div>

	<div class="hero-top">
		<h1 class="hero-brand">
			<a class="hero-brand-control hero-brand-desktop" href="<?php echo esc_url( home_url( '/' ) ); ?>" data-drive-hold data-drive-url="<?php echo esc_url( home_url( '/drive/' ) ); ?>">
				<?php bloginfo( 'name' ); ?>
				<span class="hero-drive-hold-track" aria-hidden="true"><span></span></span>
			</a>
			<button class="hero-brand-control hero-brand-touch" type="button" data-drive-hold data-drive-url="<?php echo esc_url( home_url( '/drive/' ) ); ?>" data-home-url="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php echo esc_attr( get_bloginfo( 'name' ) . '，长按打开个人云盘' ); ?>">
				<?php bloginfo( 'name' ); ?>
				<span class="hero-drive-hold-track" aria-hidden="true"><span></span></span>
			</button>
		</h1>
		<nav class="hero-nav">
				<ul class="hero-menu">
					<?php get_template_part( 'template-parts/nav-links' ); ?>
				</ul>
			</nav>

			<?php get_template_part( 'template-parts/appearance-toggle' ); ?>
			<div class="hero-search">
				<button class="hero-search-toggle" type="button" aria-label="<?php esc_attr_e( '搜索', 'liquidglass' ); ?>" aria-expanded="false" aria-controls="hero-search-form">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"/>
						<line x1="21" y1="21" x2="16.65" y2="16.65"/>
					</svg>
				</button>
				<form id="hero-search-form" class="hero-search-form" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" aria-hidden="true">
					<label class="screen-reader-text" for="hero-search-input"><?php esc_html_e( '搜索文章', 'liquidglass' ); ?></label>
					<input id="hero-search-input" type="search" name="s" class="hero-search-input" placeholder="<?php esc_attr_e( '输入关键词搜索...', 'liquidglass' ); ?>" autocomplete="off">
				</form>
		</div>
	</div>

	<p class="hero-message">
		<span class="hero-typewriter-wrap" aria-hidden="true">
			<span class="hero-typewriter-text"><?php echo esc_html( $hero_message ); ?></span>
		</span>
		<span class="screen-reader-text"><?php echo esc_html( $hero_message ); ?></span>
	</p>

	<div class="hero-bottom">
		<a href="#content-start" class="hero-scroll">
			<span class="hero-scroll-text"><?php esc_html_e( '浏览文章', 'liquidglass' ); ?></span>
			<span class="hero-scroll-arrow">&#8595;</span>
		</a>
	</div>
</section>
