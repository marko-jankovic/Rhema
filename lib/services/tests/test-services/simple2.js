module.exports = function (options, $helpers) {
    return function simple2 (string) {
        return $helpers.string.plural(string);
    };
};
