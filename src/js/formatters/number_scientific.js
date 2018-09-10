export default function formatScientificNumber(val, decimals) {
    return val.toExponential(decimals);
}