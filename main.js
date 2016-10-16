//MODELO
//este tipo de funciones son funciones que se autoejecutan
(function () {
//Asi se crea una clase de objeto en javascript, usando el constructor del objeto
//al crea el tipo o clase de objeto, despues se pueden crear los objetos de este tipo
//self es una propiedad del objeto window, que retorna el valor de la ventana actual
//como window es un objeto con scope global, puede ser accedido y modificado desde cualquier parte del codigo
//asimismo, como self es una propiedad de window, no hace falta colocar window.self, cada vez que se va a usar
//solamente con colocar self se entiende que es la propiedad del objeto window
self.Board = function (width, height) {
	this.width = width;
	this.height = height;
	this.playing= false;
	this.game_over=false;
//bars son las barras que controla el usuario
this.bars= [];
this.ball=null;
this.playing=false;
//aqui termina la clase
};

self.Board.prototype = {
	get elements(){
		//el metodo map, aplica la funcion a cada elemento del arreglo, y devuelve un nuevo arreglo, en este caso
		// la funcion no hace distinto, solamente retorna los mismo valores del arreglo y lo almacena en la variable
		//elements, simplemente lo copia
		var elements =this.bars.map(function(bar){return bar;});
		elements.push(this.ball);
		return elements;
	}
}
})();

(function(){
	self.Ball= function(x,y,radius,board){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.speed_y=0;
		this.speed_x=3;
		this.board=board;
		this.speed=3;
		board.ball=this;
		this.kind="circle";
		//con direction se mueve la pelota a la derecha cuando es 1, y a la izquierda cuando es -1
		this.direction=1;
		this.bounce_angle=0;
		this.max_bounce_angle= Math.PI/12;
	}
		self.Ball.prototype = {
				//para mover la pelota
				move: function () {
				this.x += (this.speed_x*this.direction);
				this.y += (this.speed_y);
				},
				//se usa get width y height porque la pelota no tiene width, sino un radio, el width y height seria el doble
				// del radio
				//si no tiene width ni height la pelota, entonces no va a detectar la colision
				get width(){
					return this.radius*2;
				},
				get height(){
					return this.radius*2;
				},
				collision:function (bar) {
					//reacciona a la colision con una barra que recibe como parametro
					//no hay que entender esto, es la logica para la colision y el angulo del rebote
					var relative_intersect_y = ( bar.y + (bar.height / 2) ) - this.y;

					var normalized_intersect_y = relative_intersect_y / (bar.height / 2);

					this.bounce_angle = normalized_intersect_y * this.max_bounce_angle;
					console.log(this.bounce_angle);
					this.speed_y = this.speed * -Math.sin(this.bounce_angle);
					this.speed_x = this.speed * Math.cos(this.bounce_angle);

					if(this.x > (this.board.width / 2)) this.direction = -1;
					else this.direction = 1;

				}
		};
})();


(function(){
//constructor para el objeto Bar, las barras
self.Bar = function(x,y,width,height,board){
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.board=board;
//añade esta barra a la clase board, en la ultima posicion del arreglo bars
this.board.bars.push(this);
this.kind="rectangle";
this.speed =10;

}
self.Bar.prototype = {
	down:function(){
		this.y += this.speed;

	},
	up:function(){
		this.y -=this.speed;

	},
	toString: function(){
		//esta modificacion al metodo toString, hace que unicamente retorne el valor de x y y
		return "x: "+ this.x +" y: "+this.y;
	}
}

})();

//VISTA
(function(){
	self.BoardView = function(canvas, board){
		this.canvas=canvas;
		this.canvas.width = board.width;
		this.canvas.height = board.height;
		this.board = board;
		this.ctx = canvas.getContext("2d");
	}

	self.BoardView.prototype = {
		//funcion para limpiar el canvas
		clean: function(){
			this.ctx.clearRect(0,0,this.board.width,this.board.height);
		},

		draw: function(){
			for (var i = this.board.elements.length - 1; i >= 0; i--) {
				var el = this.board.elements[i];	
				draw (this.ctx,el);
			}
		},
		check_collisions: function(){
			for (var i = this.board.bars.length - 1; i >= 0; i--) {
				var bar = this.board.bars[i]
				if (hit(bar, this.board.ball)){
					this.board.ball.collision(bar);
			}
				}
		}, 
		play: function(){
			if (this.board.playing){
			this.clean();
			this.draw();
			this.check_collisions();
			this.board.ball.move();
			}
		}
	};

	function hit (a,b) {
		var hit =false;
		if (b.x +b.width >= a.x &&  b.x< a.x +a.width) {
			if (b.y + b.height >= a.y && b.y < a.y +a.height) {
				hit =true;
			};
		};
		if (b.x <= a.x && b.x + b.width >= a.x +a.width) {
			if (b.y <= a.y && b.y + b.height >= a.y + a.height) {
				hit = true;
				
			};
		};
		if (a.x <= b.x && a.x + a.width >= b.x +b.width) {
			if (a.y <= b.y && a.y + a.height >= b.y + b.height) {
				hit = true;
				
			};
		};
	return hit; 
	}


	function draw (ctx,element){

//el metodo hasownproperty retorna true o false, dependiendo si el objeto tiene la propiedad que se le pasa como
//parametro
//if (element!==null && element.hasOwnProperty("kind")) {
	switch (element.kind) {
		case "rectangle":
		ctx.fillRect(element.x, element.y,element.width,element.height);
		break;
		case"circle":
		ctx.beginPath();
		ctx.arc(element.x, element.y, element.radius,0,7);
		ctx.fill();
		ctx.closePath();
		break;
	}

//}
}
})();

var board = new Board (800,400);
var bar = new Bar(20,100,40,100,board);
var bar_2 = new Bar(735,100,40,100,board);
var canvas = document.getElementById("canvas");
var board_view = new BoardView(canvas,board);
var ball = new Ball(350,100,10,board);



document.addEventListener("keydown",function(ev){
	//preventdefault previene el comportamiento por defecto de la tecla que se presiona
	//en este caso evita que la vista de la pagina haga scroll hacia arriba y hacia abajo, cuando se presionan las teclas
	
	if (ev.keyCode ==38) {
		ev.preventDefault();
		bar.up();
	}
	else if (ev.keyCode ==40) {
		ev.preventDefault();
		bar.down();
	}
	else if (ev.keyCode ==87) {
		ev.preventDefault();
		// W
		bar_2.up();
	}
	else if (ev.keyCode ==83) {
		ev.preventDefault();
		// S
		bar_2.down();
	}
	else if (ev.keyCode===32) {
		ev.preventDefault();
		//si boaard.playing esta true, lo coloca en false, y viceversa
		board.playing = !board.playing;
	}
	///dos formas de imprimir  lo mismo, convierte bar en una cadena (string)
	//console.log(""+bar_2);
	//console.log(bar_2.toString());

});

//window.addEventListener("load", main);

board_view.draw();

//es mejor usar requestanimationframe que setinterval para seguir ejecutando el codigo.
//se le pasa como parametro la funcion que se va a ejecutar en el siguiente frame
//hay que ejecutar de nuevo el requestanimationframe desde la funcion que se ejecuta para que se mantenga en ejecucion
window.requestAnimationFrame(controller);
//ALGO ASI COMO UN CONTROLADOR
function controller() {
	board_view.play();
	window.requestAnimationFrame(controller);

};