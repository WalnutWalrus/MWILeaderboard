$(document).ready(function() {
    function loadTabContent(tabName, callback) {
        $('#content').load(`pages/${tabName}.html`, callback);
    }


    $('nav button').click(function() {
        const tabName = $(this).data('tab');
        loadTabContent(tabName, function() {
            const tabInitializers = {
                'milking': initializeDataTable,
                'woodcutting': initializeDataTable,
                'foraging': initializeDataTable,
                'cheesesmithing': initializeDataTable,
                'crafting': initializeDataTable,
                'tailoring': initializeDataTable,
                'cooking': initializeDataTable,
                'brewing': initializeDataTable,
                'enhancing': initializeDataTable,
                'stamina': initializeDataTable,
                'intelligence': initializeDataTable,
                'attack': initializeDataTable,
                'power': initializeDataTable,
                'defense': initializeDataTable,
                'ranged': initializeDataTable,
                'magic': initializeDataTable,
                'guild': initializeGuildDataTable,
                'combat': initializeCombatDataTable,
                'taskPoints': initializeTaskPointsDataTable,
                'totalLevel': initializeTotalLevelDataTable,
                'totalHourly': initializeTotalHourlyDataTable,
                'activity': initializeActivityDataTable
            };
            if (tabInitializers[tabName]) {
                tabInitializers[tabName](tabName);
            }
        });

        //Active tab style control
        $("nav button").removeClass("active-tab");
        $(this).addClass("active-tab");

    });

    function timeToString(utcString, prefix = "") {
        const formattedTime = toLocalFormattedTime(utcString);
        return ["Already Rank 1", "Not catching up", "N/A"].includes(utcString)
            ? utcString
            : `${prefix} ${formattedTime}`;
    }

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

         if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }

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

//                    const hourlyXP = (player[`${capitalizedTabName}HourlyXP`] !== null && typeof player[`${capitalizedTabName}HourlyXP`] !== 'undefined') ?
//                                     player[`${capitalizedTabName}HourlyXP`] :
//                                     "Unknown"; //Handle new players on the LB. Still shows undefined for overtake
//                                     //I probably need to add this to the other initializeDataTable setups
//                                     //#TODO so I can find this when I need to fix it.
//                                     //Ternary below is better, above breaks sorting.

                    playerDataArray.push([
                        0,
                        player.Name,
                        player[`${capitalizedTabName}EndingLevel`],
                        player[`${capitalizedTabName}EndingXP`],
//                        hourlyXP,
                        player[`${capitalizedTabName}HourlyXP`] || 0,
                        levelUpTime,
                        overtakeTime
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: `${capitalizedTabName} Level` },
                    { title: `${capitalizedTabName} Ending XP` },
                    { title: `${capitalizedTabName} Hourly XP` },
                    { title: `Next Level Up Time` },
                    { title: `Overtake Time` }
                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: 2, orderData: 3 },
                    { targets: 3, visible: false },
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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

    // Fetch the JSON data
    fetch('output.json')
        .then(response => response.json())
        .then(data => {
            displayUpdated(data);
        })
        .catch(error => {
            console.error("Error fetching the JSON data:", error);
        });


    function displayUpdated(data) {
        // Convert to user's local time
        const localStartTime = moment(data.metadata.startTime).local().format('h:mma, Do MMMM YYYY');
        const localEndTime = moment(data.metadata.endTime).local().format('h:mma, Do MMMM YYYY');

        document.getElementById('startTime').innerText = localStartTime;
        document.getElementById('endTime').innerText = localEndTime;

        // Calculate time ago
        const now = moment();
        const endTime = moment(data.metadata.endTime).local();
        const duration = moment.duration(now.diff(endTime));

        let timeAgoText = "";
        if (duration.asMinutes() < 60) {
            timeAgoText = `${Math.round(duration.asMinutes())} minutes`;
        } else if (duration.asHours() < 24) {
            timeAgoText = `${Math.round(duration.asHours())} hours`;
        } else {
            timeAgoText = `${Math.round(duration.asDays())} days`;
        }

        document.getElementById('timeAgo').innerText = timeAgoText;

        // Show time difference in hours
        const timeDiffInHours = Math.round(data.metadata.timeDifference / 60); // as the time difference is given in minutes
        document.getElementById('timeDifference').innerText = timeDiffInHours;
    }


    function initializeGuildDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);
//       TODO move the following to all areas as new tabs added? seems dumb.
        if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }
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

                    const nextGuildSlot = timeToString(
                        player[`NextGuildSlot`],
                        countdownToLocalTime(player[`NextGuildSlot`])
                    );

                    playerDataArray.push([
                        0,
                        player.Name,
                        player[`${capitalizedTabName}EndingLevel`] || 0,
                        player[`${capitalizedTabName}EndingXP`] || 0,
                        player[`${capitalizedTabName}HourlyXP`] || 0,
                        levelUpTime,
                        nextGuildSlot,
                        overtakeTime
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: `${capitalizedTabName} Level` },
                    { title: `${capitalizedTabName} Ending XP` },
                    { title: `${capitalizedTabName} Hourly XP` },
                    { title: `Next Level Up Time` },
                    { title: `Next Guild Slot` },
                    { title: `Overtake Time` }
                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: 2, orderData: 3 },
                    { targets: 3, visible: false },
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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

    function initializeCombatDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);

         if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }

        $.getJSON('output.json', function(data) {
            var playerDataArray = [];
            $.each(data.playerData, function(index, player) {
                if (player[`${capitalizedTabName}HourlyXP`]) {

                    playerDataArray.push([
                        0,
                        player.Name,
                        player[`${capitalizedTabName}HourlyXP`] || 0,
                        player[`StaminaHourlyXP`] || 0,
                        player[`DefenseHourlyXP`] || 0,
                        player[`IntelligenceHourlyXP`] || 0,
                        player[`AttackHourlyXP`] || 0,
                        player[`PowerHourlyXP`] || 0,
                        player[`MeleeHourlyXP`] || 0,
                        player[`MeleeHourlyXPNormal`] || 0,
                        player[`RangedHourlyXP`] || 0,
                        player[`MagicHourlyXP`] || 0
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: `Total ${capitalizedTabName} Hourly XP` },
                    { title: `Stamina` },
                    { title: `Defense` },
                    { title: `Intelligence` },
                    { title: `Attack` },
                    { title: `Power` },
                    { title: `Melee Total` },
                    { title: `Melee Norm` },
                    { title: `Ranged` },
                    { title: `Magic` }
                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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

    function initializeTaskPointsDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);

         if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }

        $.getJSON('output.json', function(data) {
            var playerDataArray = [];
            $.each(data.playerData, function(index, player) {
                if (player[`${capitalizedTabName}EndingLevel`]) {

                    playerDataArray.push([
                        0,
                        player.Name,
                        player.TaskPointsEndingLevel || 0,
                        player.TaskPointsEarned || 0
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: "Ended With" },
                    { title: "Earned" },

                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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

    function initializeTotalLevelDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);

         if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }

        $.getJSON('output.json', function(data) {
            var playerDataArray = [];
            $.each(data.playerData, function(index, player) {
                if (player[`${capitalizedTabName}EndingLevel`]) {

                    playerDataArray.push([
                        0,
                        player.Name,
                        player.TotalLevelEndingLevel || 0,
                        player.TotalLevelEndingXP || 0,
                        player.TotalLevelHourlyXP || 0
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: "Last Known Total Level" },
                    { title: "Last Known Total XP" },
                    { title: "Hourly XP (over all skills)" }
                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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

    function formatNumberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function renderNumberWithCommas(data, type) {
        if (type === 'display' && !isNaN(data) && data !== null) {
            return formatNumberWithCommas(data);
        }
        return data;
    }

    function initializeTotalHourlyDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);

         if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }

        $.getJSON('output.json', function(data) {
            var playerDataArray = [];
            $.each(data.playerData, function(index, player) {
                if (player[`${capitalizedTabName}XP`]) {
                    playerDataArray.push([
                        0,
                        player.Name,
                        player.TotalHourlyXP || 0,
                        player.StaminaHourlyXP || 0,
                        player.IntelligenceHourlyXP || 0,
                        player.AttackHourlyXP || 0,
                        player.PowerHourlyXP || 0,
                        player.DefenseHourlyXP || 0,
                        player.RangedHourlyXP || 0,
                        player.MagicHourlyXP || 0,
                        player.CheesesmithingHourlyXP || 0,
                        player.CraftingHourlyXP || 0,
                        player.TailoringHourlyXP || 0,
                        player.CookingHourlyXP || 0,
                        player.BrewingHourlyXP || 0,
                        player.EnhancingHourlyXP || 0,
                        player.MilkingHourlyXP || 0,
                        player.ForagingHourlyXP || 0,
                        player.WoodcuttingHourlyXP || 0
                    ]);
                }
            });

            $(`#${tabName}Table`).DataTable({
                data: playerDataArray,
                columns: [
                    { title: "Position" },
                    { title: "Name" },
                    { title: "Total" },
                    { title: "Stamina" },
                    { title: "Intelligence" },
                    { title: "Attack" },
                    { title: "Power" },
                    { title: "Defense" },
                    { title: "Ranged" },
                    { title: "Magic" },
                    { title: "Cheesesmithing" },
                    { title: "Crafting" },
                    { title: "Tailoring" },
                    { title: "Cooking" },
                    { title: "Brewing" },
                    { title: "Enhancing" },
                    { title: "Milking" },
                    { title: "Foraging" },
                    { title: "Woodcutting" }
                ],
                drawCallback: function(settings) {
                    // Renumber the "Position" column on each draw
                    var api = this.api();
                    api.column(0, { page: 'current' }).nodes().each(function(cell, i) {
                        cell.innerHTML = i + 1;
                    });
                },
                colReorder: true,
                order: [[2, 'desc']],
                columnDefs: [
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
                ],
                responsive: false,
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

    function initializeActivityDataTable(tabName) {
        const capitalizedTabName = capitalizeFirstLetter(tabName);
        if ($.fn.DataTable.isDataTable(`#${tabName}Table`)) {
            $(`#${tabName}Table`).DataTable().destroy();
        }
        $.getJSON('output.json', function(data) {
            var skillDataArray = [];
            $.each(data.skillData, function(skill, count) {
                const skillName = skill.replace("Active", "").replace("New", "");
                if (skill.indexOf("Active") !== -1) {
                    let activeCount = data.skillData[skillName + "Active"] || 0;
                    let newCount = data.skillData[skillName + "New"] || 0;
                    let totalCount = activeCount + newCount;

                    skillDataArray.push([
                        skillName,
                        activeCount,
                        newCount,
                        totalCount
                    ]);
                }
            });
            $(`#${tabName}Table`).DataTable({
                data: skillDataArray,
                columns: [
                    { title: "Skill" },
                    { title: "Active" },
                    { title: "New" },
                    { title: "Total" }
                ],
                colReorder: true,
                order: [[3, 'desc']],
                columnDefs: [
                    { targets: "_all", orderSequence: ["desc", "asc"], render: renderNumberWithCommas }
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
