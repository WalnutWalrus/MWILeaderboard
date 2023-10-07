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

    $('#yourTableID').DataTable({
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            'copy', 'excel', 'pdf'
        ],
        // Add this to use Bootstrap 5 styles
        "pagingType": "full_numbers",
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        responsive: true,
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Search records",
        }
    });
});
