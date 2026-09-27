<?php
/**
 * 模板部件：杂志流单篇文章卡片
 */
$categories = get_the_category();
?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'entry-card glass-card' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="entry-thumb">
			<a href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
				<?php the_post_thumbnail( 'medium_large', array( 'loading' => 'lazy', 'class' => 'glass-img' ) ); ?>
			</a>
		</div>
	<?php endif; ?>
	<div class="entry-body">
		<?php if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) : ?>
			<div class="entry-category">
				<a href="<?php echo esc_url( get_category_link( $categories[0]->term_id ) ); ?>"><?php echo esc_html( $categories[0]->name ); ?></a>
			</div>
		<?php endif; ?>
		<header class="entry-header">
			<?php the_title( sprintf( '<h2 class="entry-title"><a href="%s">', esc_url( get_permalink() ) ), '</a></h2>' ); ?>
			<div class="entry-meta">
				<time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo get_the_date(); ?></time>
			</div>
		</header>
		<div class="entry-summary">
			<?php the_excerpt(); ?>
		</div>
	</div>
</article>
