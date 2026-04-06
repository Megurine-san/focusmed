// Global database container
var database = window.database || {};

// Separate container for Arena Mode questions
if (!database.questions) {
    database.questions = {};
}