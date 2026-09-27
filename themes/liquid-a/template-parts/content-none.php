<?php
/**
 * 模板部件：没有文章/内容时的显示
 */
?>
<section class="no-results not-found glass-card">
	<header class="page-header">
		<h1 class="page-title"><?php esc_html_e( '没有文章', 'liquidglass' ); ?></h1>
	</header>
	<div class="page-content">
		<?php if ( is_home() && current_user_can( 'publish_posts' ) ) : ?>
			<p><?php printf( esc_html__( '开始你的第一篇文章吧！ <a href="%s">点击这里</a>。', 'liquidglass' ), esc_url( admin_url( 'post-new.php' ) ) ); ?></p>
		<?php elseif ( is_search() ) : ?>
			<p><?php esc_html_e( '没有符合搜索条件的结果，请尝试其他关键词。', 'liquidglass' ); ?></p>
			<?php get_search_form(); ?>
		<?php else : ?>
			<p><?php esc_html_e( '似乎找不到你正在寻找的内容。也许搜索可以帮到你。', 'liquidglass' ); ?></p>
			<?php get_search_form(); ?>
		<?php endif; ?>
	</div>
</section>
