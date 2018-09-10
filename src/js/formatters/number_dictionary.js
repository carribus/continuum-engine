const postfixes = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", 
                   "D", "Ud", "Dd", "Td", "qd", "Qd", "sd", "Sd", "Od", "Nd", 
                   "V", "Uv", "Dv", "Tv", "qv", "Qv", "sv", "Sv", "Ov", "Nv"];

export default function formatDictionaryNumber(val, decimals) {
    const components = val.toExponential(decimals).split("e");
    const roundValTo = (val, roundTo) => { return Math.floor(val/roundTo)*roundTo };
    const getPostFix = (exp) => { return postfixes[Math.floor(exp/3)] };
    let [str, exp] = components;

    exp = parseInt(exp);

    str = (val / Math.pow(10, roundValTo(Math.max(0, exp), 3))).toFixed(decimals) + getPostFix(Math.max(0, exp));

    return str;
}