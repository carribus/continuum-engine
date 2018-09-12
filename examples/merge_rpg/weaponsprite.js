import EventEmitter from "./engine/js/eventemitter.js";

export default class WeaponSprite extends EventEmitter {
    constructor(producer, texture, x, y) {
        super();
        this.producer = producer;
        this.cell = null;

        this.sprite = new PIXI.Sprite(texture);
        if (this.sprite) {
            this.sprite.interactive = true;
            this.sprite.x = x;
            this.sprite.y = y;
            this.sprite.on('mousedown', this.onDragStart.bind(this));
            this.sprite.on('touchstart', this.onDragStart.bind(this));
            this.sprite.on('mouseup', this.onDragEnd.bind(this));
            this.sprite.on('touchend', this.onDragEnd.bind(this));
            this.sprite.on('mousemove', this.onDragMove.bind(this));
            this.sprite.on('touchmove', this.onDragMove.bind(this));
        }

        this.onDragStart = null;
        this.onDragMove = null;
        this.onDragEnd = null;
    }

    onDragStart(e) {
        if (this.onDragStart) {
            this.onDragStart({
                pixievent: e,
                object: this
            })
        };
    }

    onDragMove(e) {
        if (this.onDragMove) {
            this.onDragMove({
                pixievent: e,
                object: this
            });
        }
    };

    onDragEnd(e) {
        console.log('dragend');
        if (this.onDragEnd) {
            this.onDragEnd({
                pixievent: e,
                object: this
            });
        }
    }

}