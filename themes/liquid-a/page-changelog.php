<?php
/**
 * Template Name: 隐藏更新日志
 *
 * 仅通过直接地址访问的站点迭代记录，不加入公开导航。
 */

get_header();

$changelog_entries = array(
	array(
		'iteration' => 'ITERATION 19', 'date' => '2026-10-03',
		'title' => '搬到 law100 的首页',
		'summary' => '正式地址更换为 home.law100.xyz，站名统一为 law100的首页。',
		'changes' => array( '旧 blog 地址保留文章路径和查询参数，永久跳转到新地址。', '更新 HTTPS、WordPress 正式地址与 Savio 网页来源校验，保留账户、文章和评论数据。', '原域名与新域名分别保留证书及续期配置；其他独立站点保持不变。' ),
	),
	array(
		'iteration' => 'ITERATION 18', 'date' => '2026-10-03',
		'title' => '让首页手写题字更快出现',
		'summary' => '保留原来的手写字形，首页只加载题字所需的 13 个字。',
		'changes' => array( '题字字体从约 3.57 MB 缩小到 4.44 KB，桌面与手机使用同一套原始字形。', '打字动画等待字体就绪后启动，避免普通字体暂时代替手写字体并截断句子。', '加载失败时完整显示备用文字，联网恢复后重试；原字体保留备份，不随公开仓库分发。' ),
	),
	array(
		'iteration' => 'ITERATION 17', 'date' => '2026-09-18',
		'title' => '为阅读添一盏夜灯',
		'summary' => '博客支持日间、夜间与跟随系统，在搜索右侧一键切换。',
		'changes' => array( '记住当前浏览器的显示偏好，跨页、跨标签页保持一致。', '夜间使用中性炭灰纸面，适配文章、讨论、搜索、关于和 Savio 登录界面。', '保留风景和照片原色，支持减少动态、无脚本与存储不可用时的回退。', 'Studio、Drive 与账户、文章数据均保持不变。' ),
	),
	array(
		'iteration' => 'ITERATION 16', 'date' => '2026-09-13',
		'title' => '让文章与讨论回到阅读中心',
		'summary' => '文章改为居中单栏，手机阅读更宽敞，评论身份先于输入呈现。',
		'changes' => array( '移除文章页默认侧栏，统一正文、文章导航和讨论区的阅读轴线。', '长文增加可折叠目录，阅读进度按正文计算。', '手机文章导航根据阅读方向收放，搜索与输入时保持稳定。', '评论先显示身份，统一提示与单层焦点边框，保留原有审核与 Savio 身份规则。' ),
	),
	array(
		'iteration' => 'ITERATION 15',
		'date'      => '2026-08-31',
		'title'     => '让 Savio 账户走进博客讨论',
		'summary'   => '保留游客留言与 WordPress 评论存储，同时让已验证的 Savio 用户以公开昵称直接参与讨论。',
		'changes'   => array(
			'为 Savio 增加独立的网页会话、公开昵称和登录、注册、验证、找回密码流程。',
			'网页只保存 HttpOnly 安全 Cookie，不向 JavaScript 暴露 Savio 令牌或密码。',
			'新增第一方评论身份桥接插件，不复制账户、不创建影子 WordPress 用户。',
			'已验证 Savio 评论直接发布，游客继续沿用首次留言审核规则。',
			'修复 Savio 身份进入 WordPress 原生评论流程的时机，避免已登录用户被姓名和邮箱必填校验拦截。',
			'在评论纸面中加入克制的 Savio 身份印记，并完成桌面与手机登录界面适配。',
			'保持 Android 原有认证、会话、同步接口和现有账户数据不变。',
		),
	),
	array(
		'iteration' => 'ITERATION 14',
		'date'      => '2026-08-31',
		'title'     => '统一 Studio 的选择控件',
		'summary'   => '用清晰、克制的弹出菜单与双选开关替代浏览器原生选择框，让桌面与手机操作保持一致。',
		'changes'   => array(
			'将文章、页面与编辑器中的状态和分类选择统一为 Apple 式弹出菜单。',
			'菜单会根据可用空间自动向上或向下展开，并约束在屏幕安全边距内。',
			'以滑动双选控件替换“允许评论 / 关闭评论”，保留原生单选语义和键盘操作。',
			'补齐方向键、Home、End、Enter、Escape、Tab 与焦点恢复等无障碍交互。',
			'修复手机设置抽屉中弹出菜单被裁切，以及关闭菜单时误关整个抽屉的问题。',
			'支持减少动态和减少透明度偏好，不引入第三方界面或动画依赖。',
		),
	),
	array(
		'iteration' => 'ITERATION 13',
		'date'      => '2026-08-30',
		'title'     => '内容后台成为独立的 law100 Studio',
		'summary'   => '保留 WordPress 的内容与接口能力，把日常写作从原生后台外壳中完整分离出来。',
		'changes'   => array(
			'新增独立的 /studio/ 内容工作台与专用登录页，不再依赖 wp-admin 的页面结构和视觉样式。',
			'完成文章、页面、评论、媒体、分类与系统状态管理，并以稿件轨道组织最近编辑内容。',
			'新增轻量 WordPress 区块编辑器、本地恢复、自动保存、预览与多标签页冲突保护。',
			'统一 WordPress 与媒体地址为 HTTPS，并让 HTTP 请求自动跳转到安全连接。',
			'保留带时效的原生后台应急入口，Studio 停用后可立即恢复 WordPress 默认后台。',
			'完成桌面、平板断点与 390px 手机端的实际点击、悬停和截图复查。',
		),
	),
	array(
		'iteration' => 'ITERATION 12',
		'date'      => '2026-08-29',
		'title'     => '重建后台导航的四种响应式状态',
		'summary'   => '让展开侧栏、图标栏、自动折叠与手机抽屉使用同一套克制、可预测的导航规则。',
		'changes'   => array(
			'桌面展开固定为 216px，手动与自动折叠统一为 56px 图标栏，并让正文偏移始终同步。',
			'将二级菜单改为白色细边框浮层，清除原生黑块、亮蓝底、三角箭头和多余蓝线。',
			'手机端改为 288px 覆盖式抽屉，加入可关闭遮罩并修复正文被原生脚本推宽的问题。',
			'区分鼠标与键盘焦点：点击不残留黑框，Tab 操作继续显示清晰的黑色轮廓。',
			'修整中等宽度媒体筛选栏和系统卡片状态，避免搜索框、标题与操作项互相挤压。',
			'完成 1920px、1440px、960px、783/782px 和 390px 的逐页截图与交互复查。',
		),
	),
	array(
		'iteration' => 'ITERATION 11',
		'date'      => '2026-08-29',
		'title'     => '收住后台里漏出的原生悬停样式',
		'summary'   => '用真实鼠标逐项检查菜单、下拉层和审核队列，把遮字的大色块与低对比文字收回统一视觉系统。',
		'changes'   => array(
			'取消桌面侧栏非当前菜单的悬停飞出层，避免覆盖工作台正文。',
			'将侧栏悬停统一为浅灰底深色字，并清除 WordPress 原生蓝色大块。',
			'提高顶部站点和账户下拉菜单文字对比度，补齐清晰的悬停状态。',
			'移除手机菜单打开时的黑色按钮块，并将键盘焦点统一为蓝色轮廓。',
			'重新分配评论表格列宽，将英文文章标题限制为两行，评论行高度缩短约一半。',
			'完成桌面鼠标悬停、390px 手机菜单、评论隐私与横向溢出复查。',
		),
	),
	array(
		'iteration' => 'ITERATION 10',
		'date'      => '2026-08-29',
		'title'     => '后台变成个人内容工作台',
		'summary'   => '把为大型网站准备的 WordPress 后台，整理成只服务 law100 写作与维护的安静桌面。',
		'changes'   => array(
			'新增第一方 law100-admin 插件，统一登录页、工作台、导航、内容列表和编辑器外壳。',
			'用今日工作条、内容概览、最近文章、评论与系统状态替换默认仪表盘小工具。',
			'将更新、插件、用户、工具和设置集中到系统区，保留全部原生权限与地址。',
			'隐藏登录后的前台管理工具栏，避免它继续挤压博客首屏。',
			'移除未被公开内容使用的 Elementor、默认套件和专属网络兼容文件。',
			'重新适配桌面与手机后台，并保留 WordPress 原生编辑、评论审核和更新能力。',
		),
	),
	array(
		'iteration' => 'ITERATION 09',
		'date'      => '2026-08-28',
		'title'     => '把评论区写成一页连续的讨论',
		'summary'   => '保留 WordPress 的可靠提交与审核流程，重新整理阅读之后的回应方式。',
		'changes'   => array(
			'新增主题级评论模板，停止使用 WordPress 默认兼容层与编号列表。',
			'将评论标题简化为“讨论”和独立数量，不再重复文章标题。',
			'绘制统一的访客 SVG 头像，并移除 Gravatar 外部请求和默认灰色头像。',
			'重排评论、姓名、邮箱与记忆选项，彻底移除网站字段。',
			'保留五层嵌套回复、首次评论审核、Cookie 记忆和原生提交接口。',
			'为深层回复、触控目标、键盘焦点和手机窄屏补齐无障碍适配。',
		),
	),
	array(
		'iteration' => 'ITERATION 08',
		'date'      => '2026-08-28',
		'title'     => '关于页不再像一份模板',
		'summary'   => '用真实项目、非对称排版和一组安静的联系列表，重新介绍 law100。',
		'changes'   => array(
			'移除蓝色眉题、关键词胶囊、等宽介绍卡片和偏宣传式的占位文案。',
			'让页面主标题独占顶部一整行，个人介绍作为下方的小号正文阅读。',
			'将个人介绍改为与大学生、Android 开发、服务器和写作直接相关的真实内容。',
			'新增 Savio、个人服务器、博客与记录三项当前工作，并采用无卡片的档案式排列。',
			'将 GitHub、哔哩哔哩和邮箱整理成黑白联系列表，同时保留邮箱未公开状态。',
			'为当前主题建立 Git main 分支基线，并在服务器和本地分别保存主题与数据库备份。',
		),
	),
	array(
		'iteration' => 'ITERATION 07',
		'date'      => '2026-08-24',
		'title'     => '让更多操作也成为一扇真正的窗口',
		'summary'   => '文件操作菜单与名称输入窗口共享同一套居中和桌面拖动规则。',
		'changes'   => array(
			'更多操作窗口改为每次从视口正中打开，并增加清晰但克制的标题栏关闭按钮。',
			'桌面端可按住文件名标题栏拖动，拖动边界始终保留 12px 安全距离。',
			'手机端保持固定居中，禁用拖动，避免与页面滚动和触摸手势冲突。',
			'抽取通用弹窗拖动控制器，统一窗口归中、视口变化和事件清理逻辑。',
			'补充明确的 Escape 键关闭行为，避免部分 WebView 依赖原生对话框处理时失效。',
		),
	),
	array(
		'iteration' => 'ITERATION 06',
		'date'      => '2026-08-24',
		'title'     => '给文件夹窗口一条可拖动的标题栏',
		'summary'   => '输入窗口每次从视口正中打开，桌面端也能像普通窗口一样自然移动。',
		'changes'   => array(
			'新建文件夹、重命名和移动项目共用的输入窗口改为显式视口居中。',
			'桌面端可按住窗口标题栏拖动，关闭按钮等交互控件不会误触拖拽。',
			'拖动范围限制在当前视口内，窗口尺寸变化时自动回到中央。',
			'手机端保持固定居中并禁用拖拽，不影响输入法和触摸滚动。',
		),
	),
	array(
		'iteration' => 'ITERATION 05',
		'date'      => '2026-08-24',
		'title'     => '让手机长按避开 WebView 原生菜单',
		'summary'   => '桌面链接保持原样，触屏设备改用外观一致的按钮承载隐藏入口。',
		'changes'   => array(
			'桌面端继续使用原生站名链接，触屏设备仅显示同样外观的按钮。',
			'手机长按改由非被动 Touch Events 直接处理，不再依赖 Pointer Events 回退判断。',
			'阻止 Android WebView 的原生超链接长按菜单抢占 1.2 秒计时。',
			'将手机手指移动容差调整为 16px，同时保留滚动、松手、失焦和触摸取消逻辑。',
		),
	),
	array(
		'iteration' => 'ITERATION 04',
		'date'      => '2026-08-24',
		'title'     => '大文件上传与移动端隐藏入口修复',
		'summary'   => '让 Drive 真正按 8 MiB 稳定分片，也让手机上的长按入口可靠响应。',
		'changes'   => array(
			'修复 WordPress 将分片大小输出为字符串后，第二个分片错误吞入剩余文件的问题。',
			'上传过程改为优先使用服务端返回的分片大小，并统一将容量配置转换为数字。',
			'为不支持 Pointer Events 的手机浏览器补充触摸事件回退。',
			'增加指针捕获与触摸手势约束，修复长按站名时被浏览器提前取消的问题。',
		),
	),
	array(
		'iteration' => 'ITERATION 03',
		'date'      => '2026-08-24',
		'title'     => '个人云盘开始工作',
		'summary'   => '把服务器的一部分空间整理成一只安静、清晰的个人档案抽屉。',
		'changes'   => array(
			'新增隐藏的 /drive/ 页面，并通过首页 Hero 左上角站名的 1.2 秒长按进入。',
			'分配 20 GiB 逻辑配额，支持分片上传、断点续传、下载、文件夹、重命名、移动和永久删除。',
			'文件独立存放在网站目录之外，同时为系统保留至少 8 GB 可用空间。',
			'绘制 24 枚独立 SVG 图标，并完成桌面端与手机端适配。',
		),
	),
	array(
		'iteration' => 'ITERATION 02',
		'date'      => '2026-08-24',
		'title'     => '隐藏更新日志上线',
		'summary'   => '给网站留下一份从此刻开始持续生长的维护记录。',
		'changes'   => array(
			'新增只可通过 /changelog/ 直接访问的更新日志页，不加入主导航或页脚导航。',
			'从站内搜索与 WordPress 站点地图中排除本页，并设置为不被搜索引擎收录。',
			'建立按日期和迭代编号排列的版本轨道，后续更新将按时间倒序追加。',
		),
	),
	array(
		'iteration' => 'ITERATION 01',
		'date'      => '2026-08-24',
		'title'     => '让联系区域重新看见风景',
		'summary'   => '文章列表仍由浅色幕布承载，越过分界线后，固定的 Hero 风景重新出现。',
		'changes'   => array(
			'保留文章与联系区域之间的细分界线。',
			'将分界线下方的联系区域改为完全透明，不再遮挡固定背景图。',
			'取消 Hero 离开视口后隐藏背景的逻辑，确保页面底部仍能看到风景。',
			'完成桌面端与 390×844 手机端视觉校验，并确认无横向溢出。',
		),
	),
);
?>

<main id="primary" class="site-main container changelog-page">
	<header class="changelog-header">
		<div class="changelog-kicker">
			<span aria-hidden="true"></span>
			<?php esc_html_e( 'DIRECT URL ONLY', 'liquidglass' ); ?>
		</div>
		<h1><?php esc_html_e( '更新日志', 'liquidglass' ); ?></h1>
		<p><?php esc_html_e( '从 2026 年 8 月 24 日开始，记录这个站点每一次被认真修改的地方。', 'liquidglass' ); ?></p>
	</header>

	<ol class="changelog-list" aria-label="<?php esc_attr_e( '网站更新记录', 'liquidglass' ); ?>">
		<?php foreach ( $changelog_entries as $entry ) : ?>
			<li class="changelog-entry">
				<div class="changelog-meta">
					<time datetime="<?php echo esc_attr( $entry['date'] ); ?>"><?php echo esc_html( str_replace( '-', '.', $entry['date'] ) ); ?></time>
					<span><?php echo esc_html( $entry['iteration'] ); ?></span>
				</div>
				<article class="changelog-note">
					<header>
						<span class="changelog-point" aria-hidden="true"></span>
						<h2><?php echo esc_html( $entry['title'] ); ?></h2>
						<p><?php echo esc_html( $entry['summary'] ); ?></p>
					</header>
					<ul>
						<?php foreach ( $entry['changes'] as $change ) : ?>
							<li><?php echo esc_html( $change ); ?></li>
						<?php endforeach; ?>
					</ul>
				</article>
			</li>
		<?php endforeach; ?>
	</ol>
</main>

<?php
get_footer();
