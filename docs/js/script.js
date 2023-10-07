$(document).ready(function() {
    function loadTabContent(tabName) {
        $('#content').load(`pages/${tabName}.html`);
    }

    $('nav button').click(function() {
        const tabName = $(this).data('tab');
        loadTabContent(tabName);
    });

    // Load welcome tab by default
    loadTabContent('welcome');
});
