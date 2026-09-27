<?php
/**
 * 首页 Hero 下方的个人引言。
 */
$profile_intro = get_theme_mod(
	'liquidglass_profile_intro',
	'一名仍在学习、也喜欢亲手折腾工具与服务器的大学生。这里记录城市漫游、技术实践和日常观察。'
);
$post_count   = (int) wp_count_posts( 'post' )->publish;
?>

<section id="content-start" class="home-intro" aria-labelledby="home-intro-title">
	<div class="container home-intro-inner">
		<div class="home-intro-panel">
			<div class="home-intro-copy">
				<span class="home-intro-eyebrow">LAW100 / PERSONAL LOG</span>
				<h2 id="home-intro-title"><?php esc_html_e( '把路上的风景，和手边正在做的事，慢慢写下来。', 'liquidglass' ); ?></h2>
				<p><?php echo esc_html( $profile_intro ); ?></p>
			</div>
			<dl class="home-intro-facts">
				<div>
					<dt><?php esc_html_e( '正在记录', 'liquidglass' ); ?></dt>
					<dd><?php esc_html_e( '城市漫游 · 技术实践 · 日常观察', 'liquidglass' ); ?></dd>
				</div>
				<div>
					<dt><?php esc_html_e( '已经写下', 'liquidglass' ); ?></dt>
					<dd><?php echo esc_html( sprintf( _n( '%s 篇文章', '%s 篇文章', $post_count, 'liquidglass' ), number_format_i18n( $post_count ) ) ); ?></dd>
				</div>
				<div>
					<dt><?php esc_html_e( '更新方式', 'liquidglass' ); ?></dt>
					<dd><?php esc_html_e( '不赶频率，只留下值得回看的内容', 'liquidglass' ); ?></dd>
				</div>
			</dl>
		</div>
	</div>
</section>
