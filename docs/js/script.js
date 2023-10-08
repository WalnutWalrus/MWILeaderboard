$(document).ready(function() {
    function loadTabContent(tabName, callback) {
        $('#content').load(`pages/${tabName}.html`, callback);
    }


    $('nav button').click(function() {
        const tabName = $(this).data('tab');
        loadTabContent(tabName, function() {
//            if (['milking', 'woodcutting', 'foraging'].includes(tabName)) {
            if (['milking', 'woodcutting', 'foraging', 'cheesesmithing', 'crafting', 'tailoring', 'cooking', 'brewing', 'enhancing', 'stamina', 'intelligence', 'attack', 'power', 'defense', 'ranged', 'magic'].includes(tabName)) {
                initializeDataTable(tabName);
            }
        });
    });

    function timeToString(utcString, prefix = "") {
        const formattedTime = toLocalFormattedTime(utcString);
        return ["Already Rank 1", "Not catching up", "N/A"].includes(utcString)
            ? utcString
            : `${prefix} ${formattedTime}`;
    }

    // Load welcome tab by default
    loadTabContent('welcome');

    function toLocalFormattedTime(utcString) {
    // List of exception strings that are not dates
    const nonDateStrings = ["Already Rank 1", "Not catching up"];

    if (nonDateStrings.includes(utcString)) {
        return utcString;
    }

    const parsedDate = new Date(utcString);
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 1970 || parsedDate.getFullYear() > new Date().getFullYear() + 5) {
        return utcString;
    }

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('default', { month: 'long' });
    const year = parsedDate.getFullYear();
    const hour = parsedDate.getHours();
    const minute = parsedDate.getMinutes().toString().padStart(2, '0');

    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    const ampm = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);

    return `${formattedHour}:${minute}${ampm}, ${day}${suffix} ${month} ${year}`;
}


    function countdownToLocalTime(utcString) {
        if (["Already Rank 1", "Not catching up", "N/A"].includes(utcString)) {
            return utcString;
        }

        if (isNaN(Date.parse(utcString))) {
            // Return the original string if it's not a valid date
            return utcString;
        }

        const currentDate = new Date();
        const targetDate = new Date(utcString);

        // Calculate the difference in milliseconds
        const diff = targetDate - currentDate;

        if (diff <= 0) {
            return "Already happened";
        }

        // Convert to different units
        const minutesDiff = Math.floor(diff / 1000 / 60);
        const hoursDiff = Math.floor(minutesDiff / 60);
        const daysDiff = Math.floor(hoursDiff / 24);

        // Display appropriate unit
        if (minutesDiff < 60) {
            return `In ${minutesDiff} minute${minutesDiff > 1 ? 's' : ''}`;
        } else if (hoursDiff < 24) {
            return `In ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
        } else {
            return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
        }
    }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }


    function initializeDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);
        $.getJSON('output.json', function(data) {
            var playerDataArray = [];
            $.each(data.playerData, function(index, player) {
                if (player[`${capitalizedTabName}EndingLevel`]) {
                    const levelUpTime = timeToString(
                        player[`${capitalizedTabName}LevelUp`],
                        countdownToLocalTime(player[`${capitalizedTabName}LevelUp`])
                    );

                    const overtakeTime = timeToString(
                        player[`${capitalizedTabName}OvertakeTimestamp`],
                        countdownToLocalTime(player[`${capitalizedTabName}OvertakeTimestamp`])
                    );

                    playerDataArray.push([
                        player.Name,
                        player[`${capitalizedTabName}EndingLevel`],
                        player[`${capitalizedTabName}EndingXP`],
                        player[`${capitalizedTabName}HourlyXP`],
                        levelUpTime,
                        overtakeTime
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Name" },
                    { title: `${capitalizedTabName} Level` },
                    { title: `${capitalizedTabName} Ending XP` },
                    { title: `${capitalizedTabName} Hourly XP` },
                    { title: `Next Level Up Time` },
                    { title: `Overtake Time` }
                ],
                colReorder: true,
                order: [[1, 'desc']],
                columnDefs: [
                    { targets: 1, orderData: 2 },
                    { targets: 2, visible: false },
                    { targets: "_all", orderSequence: ["desc", "asc"] }
                ],
                responsive: true,
                "pageLength": 100,
                dom: 'Bfrtip',
                buttons: ['copy', 'excel', 'pdf'],
                "pagingType": "full_numbers",
                "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search records",
                }
            });
        });
    }
});
