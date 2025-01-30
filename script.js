document.addEventListener('DOMContentLoaded', function () {
    const signupSection = document.getElementById('signup-section');
    const gameSection = document.getElementById('game-section');
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('username');
    const signupButton = document.getElementById('signup-button');
    const bar = document.getElementById('bar');
    const indicator = document.getElementById('indicator');
    const targetNumberElement = document.getElementById('target');
    const playerAttemptsList = document.getElementById('player-attempts');
    const otherAttemptsList = document.getElementById('other-attempts');
    const timelineContent = document.getElementById('timeline-content');

    let targetNumber = generateRandomNumber();
    let playerAttempts = [];
    let otherPlayersAttempts = [
        { name: "Player1", difference: 50, number: 950 },
        { name: "Player2", difference: 75, number: 925 },
        { name: "Player3", difference: 90, number: 910 }
    ]; // Simulated data

    const webhookURL = 'https://discord.com/api/webhooks/1334540126415749223/hxkkSst4zcfUJ_Or-MuMpsp_jf8ZPkZOxHgUzU9j5sD2mksZ6QMg0DF-uejn10cI8vo7';

    // Set target number
    targetNumberElement.textContent = targetNumber;

    // Handle sign-up
    signupButton.addEventListener('click', function () {
        const userId = userIdInput.value.trim();
        const username = usernameInput.value.trim();

        if (userId && username) {
            // Fetch profile picture
            const profilePictureUrl = `https://www.uriven.com/Thumbs/Head.ashx?x=48&y=48&userId=${userId}`;

            // Hide sign-up section and show game section
            signupSection.style.display = 'none';
            gameSection.style.display = 'block';

            // Start the game
            startGame();
        } else {
            alert('Please enter both User ID and Username!');
        }
    });

    // Update bar and indicator
    function updateBar(number) {
        const percentage = (number / 1000) * 100;
        bar.style.left = `-${100 - percentage}%`;
        indicator.style.left = `${percentage}%`;
    }

    // Handle click on the bar
    document.getElementById('bar-container').addEventListener('click', function (e) {
        const rect = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const clickedNumber = Math.round((clickPosition / rect.width) * 1000);

        // Animate the bar
        updateBar(clickedNumber);

        // Calculate difference
        const difference = Math.abs(targetNumber - clickedNumber);
        playerAttempts.push({ number: clickedNumber, difference });
        updatePlayerAttempts();
        updateTimeline(clickedNumber, difference);

        // Send attempt to Discord webhook
        sendToDiscordWebhook(usernameInput.value.trim(), clickedNumber, difference, clickedNumber === targetNumber);

        // Check if the player hit the target
        if (clickedNumber === targetNumber) {
            alert('Congratulations! You hit the target number!');
            targetNumber = generateRandomNumber();
            targetNumberElement.textContent = targetNumber;
        }
    });

    // Update player attempts list
    function updatePlayerAttempts() {
        playerAttemptsList.innerHTML = '';
        playerAttempts
            .sort((a, b) => a.difference - b.difference)
            .slice(0, 5)
            .forEach(attempt => {
                const li = document.createElement('li');
                li.textContent = `Number: ${attempt.number}, Difference: ${attempt.difference}`;
                playerAttemptsList.appendChild(li);
            });
    }

    // Update other players' attempts list
    function updateOtherPlayersAttempts() {
        otherAttemptsList.innerHTML = '';
        otherPlayersAttempts
            .sort((a, b) => a.difference - b.difference)
            .slice(0, 5)
            .forEach(attempt => {
                const li = document.createElement('li');
                li.textContent = `${attempt.name}: Number ${attempt.number}, Difference ${attempt.difference}`;
                otherAttemptsList.appendChild(li);
            });
    }

    // Update timeline
    function updateTimeline(number, difference) {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.textContent = number;

        // Color coding
        if (difference <= 15) {
            timelineItem.classList.add('black');
        } else if (difference <= 45) {
            timelineItem.classList.add('white');
        } else if (difference <= 250) {
            timelineItem.classList.add('red');
        } else if (difference <= 500) {
            timelineItem.classList.add('blue');
        } else {
            timelineItem.classList.add('gray');
        }

        timelineContent.appendChild(timelineItem);
    }

    // Send attempt to Discord webhook as an embed
    async function sendToDiscordWebhook(username, number, difference, isJackpot) {
        const embed = {
            title: "🎯 Clicker Game Attempt",
            description: `**${username}** clicked: ${number}`,
            color: isJackpot ? 0x00ff00 : 0xff0000, // Green for jackpot, red otherwise
            fields: [
                {
                    name: "Difference",
                    value: difference.toString(),
                    inline: true
                },
                {
                    name: "Status",
                    value: isJackpot ? "🎉 JACKPOT!" : "Keep trying!",
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };

        const payload = {
            embeds: [embed]
        };

        try {
            await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Error sending to webhook:', error);
        }
    }

    // Generate a random number between 1 and 1000
    function generateRandomNumber() {
        return Math.floor(Math.random() * 1000) + 1;
    }

    // Initial updates
    updatePlayerAttempts();
    updateOtherPlayersAttempts();
});