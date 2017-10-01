module.exports = function (options, $services) {
    return function simple2 (string) {
        return $services.get('helpers').string.plural(string);
    };
};
