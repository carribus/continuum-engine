export default class ConsoleLogger {
    constructor(parentElem, hero) {
        this.parentElem = parentElem;
        this.hero = hero;
        this.consoleEnabled = true;
    }
    log(type, text) {
        if (this.consoleEnabled) {
            this.logToConsole(type, text);
        }
        if (this.parentElem) {
            this.logToDiv(type, text);
        }
    }

    logToDiv(type, text) {
        const logItem = `[L${this.hero.level} | ${this.hero.xp}/${this.hero.xpRequired} XP | ${this.hero.health}/${this.hero.maxHealth} HP] ${text}`;
        const e = document.createElement('div');
        
        e.innerText = logItem;
        e.className = "logitem_"+type;

        this.parentElem.insertBefore(e, this.parentElem.childNodes[0]);

        while (this.parentElem.childNodes.length > 200) {
            this.parentElem.removeChild(this.parentElem.childNodes[this.parentElem.childNodes.length-1]);
        }
    }

    logToConsole(type, text) {
        let logItem = `%c[L${this.hero.level} | ${this.hero.xp}/${this.hero.xpRequired} XP | ${this.hero.health}/${this.hero.maxHealth} HP] ${text}`;
        let background = "white";
        let colour = "black";

        switch (type) {
            case    "hero":
                colour = "green";
                break;

            case    "enemy":
                colour = "red";
                break;

            case    "info":
                colour = "blue"
                break;

            case    "notice":
                colour = "white";
                background = "purple";
                break;

            default:
                background = "white";
                break;
        }

        console.log(logItem, `background: ${background}; color: ${colour}`)
    }
}