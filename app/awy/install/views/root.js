//let str = 'div.container>div.panel>$hook("main")';
let str = `
<a data-bind="click showStructure">Root click</a>
<div data-bind="rootClass body_class">
	<div class="panel" data-hook="main" />
</div>
`;
export default str;