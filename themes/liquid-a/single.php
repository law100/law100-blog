<?php
/**
 * 文章页模板
 */
get_header();
?>

<div class="reading-progress" aria-hidden="true"><span></span></div>

<div class="content-layout container reading-layout">
	<main id="primary" class="site-main content-main">
		<?php
		while ( have_posts() ) :
			the_post(); ?>
			<article id="post-<?php the_ID(); ?>" <?php post_class( 'single-article reading-article' ); ?> aria-labelledby="post-<?php the_ID(); ?>-title">
				<header class="entry-header">
					<?php the_title( '<h1 id="post-' . esc_attr( get_the_ID() ) . '-title" class="entry-title">', '</h1>' ); ?>
					<div class="entry-meta">
						<span class="posted-on"><?php echo get_the_date(); ?></span>
						<span aria-hidden="true"> · </span><span class="byline"><?php the_author(); ?></span><span aria-hidden="true"> · </span><span><?php echo esc_html( liquidglass_reading_time() ); ?></span>
					</div>
				</header>

				<?php if ( has_post_thumbnail() ) : ?>
					<div class="post-thumbnail">
						<?php the_post_thumbnail( 'large', array( 'class' => 'glass-img' ) ); ?>
					</div>
				<?php endif; ?>

				<?php ob_start(); the_content(); $reading = liquidglass_reading_content( ob_get_clean() ); echo $reading['toc']; ?>
				<div class="entry-content glass-content" data-reading-body>
					<?php echo $reading['content']; ?>
				</div>

				<footer class="entry-footer">
					<?php
					$categories_list = get_the_category_list( esc_html__( ', ', 'liquidglass' ) );
					if ( $categories_list ) : ?>
						<span class="cat-links"><?php echo $categories_list; ?></span>
					<?php endif; ?>
					<?php the_tags( '<span class="tags-links">', ', ', '</span>' ); ?>
				</footer>
			</article>

			<?php

			$previous_post = get_previous_post();
			$next_post     = get_next_post();
			if ( $previous_post || $next_post ) :
				?>
				<nav class="reading-next" aria-label="<?php esc_attr_e( '文章导航', 'liquidglass' ); ?>">
					<div class="nav-links">
						<?php if ( $previous_post ) : ?>
							<div class="nav-previous">
								<div>
									<a href="<?php echo esc_url( get_permalink( $previous_post->ID ) ); ?>">
										<span class="nav-subtitle"><?php esc_html_e( '上一篇', 'liquidglass' ); ?></span>
										<span class="nav-title"><?php echo esc_html( get_the_title( $previous_post->ID ) ); ?></span>
									</a>
								</div>
							</div>
						<?php endif; ?>

						<?php if ( $next_post ) : ?>
							<div class="nav-next">
								<div>
									<a href="<?php echo esc_url( get_permalink( $next_post->ID ) ); ?>">
										<span class="nav-subtitle"><?php esc_html_e( '下一篇', 'liquidglass' ); ?></span>
										<span class="nav-title"><?php echo esc_html( get_the_title( $next_post->ID ) ); ?></span>
									</a>
								</div>
							</div>
						<?php endif; ?>
					</div>
				</nav>
				<?php
			endif;
			if ( comments_open() || get_comments_number() ) { comments_template(); }

		endwhile;
		?>
	</main><!-- #primary -->

</div>

<?php
get_footer();
