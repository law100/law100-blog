<?php
/**
 * Template Name: 文章列表
 *
 * 独立的文章归档页，使用自定义查询确保页面不会受固定首页文章数影响。
 */

get_header();

$paged = max( 1, absint( get_query_var( 'paged' ) ) );
$articles_query = new WP_Query(
	array(
		'post_type'           => 'post',
		'post_status'         => 'publish',
		'posts_per_page'      => 10,
		'paged'               => $paged,
		'ignore_sticky_posts' => true,
	)
);
?>

<main id="primary" class="site-main container articles-page">
	<header class="page-header glass-card">
		<span class="section-label"><?php esc_html_e( '文章', 'liquidglass' ); ?></span>
		<h1 class="page-title"><?php esc_html_e( '全部文章', 'liquidglass' ); ?></h1>
	</header>

	<?php if ( $articles_query->have_posts() ) : ?>
		<div class="posts-list blog-list" id="articles-container">
			<?php
			while ( $articles_query->have_posts() ) :
				$articles_query->the_post();
				get_template_part( 'template-parts/content', get_post_type() );
			endwhile;
			?>
		</div>

		<?php if ( $articles_query->max_num_pages > 1 ) : ?>
			<nav class="articles-pagination" aria-label="<?php esc_attr_e( '文章分页', 'liquidglass' ); ?>">
				<?php
				echo wp_kses_post(
					paginate_links(
						array(
							'base'      => str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ),
							'format'    => '?paged=%#%',
							'current'   => $paged,
							'total'     => (int) $articles_query->max_num_pages,
							'mid_size'  => 1,
							'prev_text' => '&#8592; ' . esc_html__( '上一页', 'liquidglass' ),
							'next_text' => esc_html__( '下一页', 'liquidglass' ) . ' &#8594;',
							'type'      => 'list',
						)
					)
				);
				?>
			</nav>
		<?php endif; ?>
	<?php else : ?>
		<?php get_template_part( 'template-parts/content', 'none' ); ?>
	<?php endif; ?>
</main>

<?php
wp_reset_postdata();
get_footer();
