Ext.setup({
	onReady: function(){
		//Se crean cada uno de los componentes del contenedor
		var TTopBar = new Ext.Toolbar({
			dock: 'top',
			title: 'Geolocation'
		});
		var myButton = new Ext.Button({
			text: 'Enviar localizacion',
			handler: function(){
				alert("Hola Mapa!");
			}
		});
		var TToolBar = new Ext.Toolbar({
			dock: 'top',
			items: [myButton]
		});
		var myMap = new Ext.Map({
		});
		//Se crea el panel que contiene los componentes
		var myPanel = new Ext.Panel({
			fullscreen: true,
			dockedItems: [TTopBar, TToolBar],
			items: [myMap]
		});
	}
});