module.exports = function (options, $helpers) {
    this.title = function getTitle (name) {
        return $helpers.string.plural(name.toUpperCase());
    };
};
