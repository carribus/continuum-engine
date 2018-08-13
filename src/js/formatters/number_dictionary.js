const postfixes = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "D"];

export function formatDictionaryNumber(val) {
    const components = val.toExponential(2).split("e");
    const roundValTo = (val, roundTo) => { return Math.floor(val/roundTo)*roundTo };
    const getPostFix = (exp) => { return postfixes[Math.floor(exp/3)] };
    let [str, exp] = components;

    exp = parseInt(exp);

    str = (val / Math.pow(10, roundValTo(Math.max(0, exp), 3))).toFixed(2) + getPostFix(Math.max(0, exp));

    return str;
}