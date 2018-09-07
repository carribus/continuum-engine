export default class Modifier {
    constructor(opts) {
        this.state = {
            key: opts.key
        }
        this.apply = opts.applyFunc;
        this.remove = opts.removeFunc;
    }
}