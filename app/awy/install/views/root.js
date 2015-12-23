//let str = 'div.container>div.panel>$hook("main")';
let str = `
<div data-bind="rootClass body_class">
	<a data-bind="click showStructure" href="javascript:void(0);">Root click</a>
	<div class="panel" data-hook="main">
	</div>
</div>
`;
export default str;