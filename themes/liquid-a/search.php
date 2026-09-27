<?php
/**
 * 搜索结果页面模板
 */
get_header();
?>

<main id="primary" class="site-main container">
	<header class="page-header glass-card">
		<h1 class="page-title">
			<?php
			/* translators: %s: search query */
			printf( esc_html__( '搜索: %s', 'liquidglass' ), '<span>' . get_search_query() . '</span>' );
			?>
		</h1>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="posts-list blog-list">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/content', get_post_type() );
			endwhile;
			?>
		</div>
		<?php the_posts_navigation(); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</main><!-- #primary -->

<?php
get_footer();
