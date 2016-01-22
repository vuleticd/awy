let str = `
<div class="body_start" data-hook="body_start"></div>
<!-- If admin is logged in  -->
<div class="header" data-hook="header"></div>
<div class="after_header" data-hook="after_header"></div>
<div class="site-main" role="main">
	<div class="container">
		<div class="before_main" data-hook="before_main"></div>
		<div class="main" data-hook="main"></div>
		<div class="after_main" data-hook="after_main"></div>
	</div>
</div>
<div class="before_footer" data-hook="before_footer"></div>
<div class="footer" data-hook="footer"></div>
<div class="before_body_end" data-hook="before_body_end"></div>
`;
export default str;