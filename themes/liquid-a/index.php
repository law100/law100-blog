<?php
/**
 * 主模板：首页含英雄区域 + 博客列表
 * 根据自定义器选择博客流或杂志流
 */
get_header();

$home_layout = get_theme_mod( 'liquidglass_home_layout', 'blog' );
$is_home_landing = is_front_page() && is_home();
?>

<?php if ( $is_home_landing ) : ?>
	<?php get_template_part( 'template-parts/hero' ); ?>
	<div id="content-start" class="home-content-cover">
<?php endif; ?>

<main id="primary" class="site-main container">

	<?php if ( have_posts() ) : ?>

		<?php if ( is_home() && ! is_front_page() ) : ?>
			<header class="page-header glass-card">
				<h1 class="page-title"><?php single_post_title(); ?></h1>
			</header>
		<?php elseif ( is_home() && is_front_page() ) : ?>
			<div class="section-heading section-heading--simple">
				<h2 class="section-title"><?php esc_html_e( '文章', 'liquidglass' ); ?></h2>
			</div>
		<?php endif; ?>

		<div class="posts-list <?php echo $home_layout === 'magazine' ? 'magazine-grid' : 'blog-list'; ?>" id="posts-container">
			<?php
			while ( have_posts() ) :
				the_post();
				if ( $home_layout === 'magazine' ) :
					get_template_part( 'template-parts/content', 'card' );
				else :
					get_template_part( 'template-parts/content', get_post_type() );
				endif;
			endwhile;
			?>
		</div>

		<?php
		the_posts_navigation( array(
			'prev_text' => '&#8592; ' . esc_html__( '上一页', 'liquidglass' ),
			'next_text' => esc_html__( '下一页', 'liquidglass' ) . ' &#8594;',
		) );

	else :
		get_template_part( 'template-parts/content', 'none' );
	endif;
	?>

</main><!-- #primary -->

<?php if ( $is_home_landing ) : ?>
	</div><!-- .home-content-cover -->
	<?php get_template_part( 'template-parts/home-contact' ); ?>
<?php endif; ?>

<?php
get_footer();
