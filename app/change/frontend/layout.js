let l =  {
	base: [
		{ hook: 'header', views: ['header'] },
		{ hook: 'footer', views: ['customblock'] }
	],
	"/custompage": [
		{ include: 'base' },
		{ hook: 'main', views: 'custompage' }
	]
}
export default l;