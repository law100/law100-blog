<?php
/**
 * 归档页面模板
 */
get_header();
?>

<main id="primary" class="site-main container">
	<header class="page-header glass-card">
		<?php
		the_archive_title( '<h1 class="page-title">', '</h1>' );
		the_archive_description( '<div class="archive-description">', '</div>' );
		?>
	</header>

	<?php if ( have_posts() ) : ?>
		<div class="posts-list blog-list">
			<?php
			while ( have_posts() ) :
				the_post();
				// 归档统一使用博客流样式
				get_template_part( 'template-parts/content', get_post_type() );
			endwhile; ?>
		</div>
		<?php the_posts_navigation(); ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</main>

<?php
get_footer();
