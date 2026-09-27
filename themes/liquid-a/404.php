<?php
/**
 * 404 页面模板
 */
get_header();
?>

<main id="primary" class="site-main container">
	<section class="error-404 not-found glass-card" style="text-align:center; padding: 4rem 2rem;">
		<header class="page-header">
			<h1 class="page-title"><?php esc_html_e( '404 - 页面未找到', 'liquidglass' ); ?></h1>
		</header>
		<div class="page-content">
			<p><?php esc_html_e( '抱歉，这个页面似乎走丢了。试试搜索或回到首页。', 'liquidglass' ); ?></p>
			<?php get_search_form(); ?>
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="glass-btn home-btn"><?php esc_html_e( '回到首页', 'liquidglass' ); ?></a>
		</div>
	</section>
</main>

<?php
get_footer();
