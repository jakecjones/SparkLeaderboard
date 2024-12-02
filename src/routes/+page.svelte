<script>
    import '$lib/assets/styles/main.scss';
    import { onMount, onDestroy, tick } from 'svelte';
    import { app } from '../firebase/config';
    import { getFirestore, onSnapshot, collection, query } from 'firebase/firestore';
    import Avatar from '$lib/components/Avatar.svelte';
    import Loader from '$lib/assets/images/loader.svg';

    const db = getFirestore(app);

    // Define the game names and display names
    const gamesList = [
        {
            name: 'enzoNextLevel',
            displayName: 'Enzo — The Next Level'
        },
        {
            name: 'make-ship-happen',
            displayName: 'Make Ship Happen'
        },
        {
            name: 'carmpart',
            displayName: 'Carmpart'
        }
    ];

    // Define the default avatar URL
    const DEFAULT_AVATAR_URL = Loader; // Replace with your default image URL

    // State variables
    let gamesData = []; // Array to hold games and their top players
    let activeUsers = []; // Array to hold active users for floating avatars

    // Map to store positions and animations for avatars
    let avatarAnimations = new Map();
    let avatarPositions = new Map();
    let avatarElements = []; // Array to store DOM element references
    let animationStarted = false;

    // Combine active users with their animation data
    $: activeUsersWithAnimations = activeUsers
        .map((user) => {
            const animationData = avatarAnimations.get(user.id);
            return animationData ? { ...user, animationData } : null;
        })
        .filter((user) => user !== null);

    onMount(async () => {
        // Query to fetch all game documents
        const gamesQuery = query(collection(db, 'games'));

        const unsubscribeGames = onSnapshot(gamesQuery, (querySnapshot) => {
            // Map to group players by game name
            let gamesMap = new Map();
            // Temporary array to hold active users
            let tempActiveUsers = [];

            // Current time in milliseconds
            const now = Date.now();
            // Time threshold (7 minutes in milliseconds)
            const activeThreshold = 7 * 60 * 1000;

            // Process each game document
            querySnapshot.forEach((doc) => {
                let data = doc.data();

                // Extract relevant data
                let gameName = data.name;
                let playerEmail = data.ownerEmail;

                // Player name is owner email split by any periods
                const emailParts = playerEmail.split('@');
                const nameParts = emailParts[0].split('.');
                let playerName = nameParts.join(' ');
                let score = data.score;
                let avatarUrl = data.avatarUrl || DEFAULT_AVATAR_URL; // Use default if missing
                let updatedAt = data.updatedAt;

                // Convert Firestore Timestamp to JavaScript Date
                let updatedAtMillis;
                if (updatedAt && updatedAt._seconds !== undefined) {
                    updatedAtMillis = updatedAt._seconds * 1000 + Math.floor(updatedAt._nanoseconds / 1e6);
                } else if (updatedAt && updatedAt.seconds !== undefined) {
                    updatedAtMillis = updatedAt.seconds * 1000 + Math.floor(updatedAt.nanoseconds / 1e6);
                } else {
                    updatedAtMillis = 0; // Default to 0 if updatedAt is missing
                }

                // Determine if the user is active (updated within the last 7 minutes)
                if (now - updatedAtMillis <= activeThreshold) {
                    tempActiveUsers.push({
                        id: doc.id,
                        email: playerEmail,
                        score: score,
                        playerName: playerName,
                        avatarUrl: avatarUrl // Includes default if necessary
                    });
                }

                // Build player object
                let player = {
                    id: doc.id,
                    email: playerEmail,
                    score: score,
                    playerName: playerName,
                    avatarUrl: avatarUrl, // Includes default if necessary
                    updatedAt: updatedAtMillis
                };

                // Group players by game name
                if (!gamesMap.has(gameName)) {
                    gamesMap.set(gameName, []);
                }
                gamesMap.get(gameName).push(player);
            });

            // Update active users
            activeUsers = tempActiveUsers;

            // Build gamesData array
            gamesData = [];
            gamesList.forEach((game) => {
                let gameName = game.name;
                let displayName = game.displayName;
                let players = gamesMap.get(gameName) || [];

                // Sort players by score descending
                players.sort((a, b) => b.score - a.score);

                // Get top 5 players
                let topPlayers = players.slice(0, 5);

                // Build game data
                gamesData.push({
                    name: gameName,
                    displayName: displayName,
                    topPlayers: topPlayers
                });
            });

            // Update avatar animations for new active users
            updateAvatarAnimations();
        });

        // Wait for the DOM to update
        await tick();

        // Start the animation loop
        startAnimationLoop();

        // Clean up listener on unmount
        return () => {
            unsubscribeGames();
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    });

    function updateAvatarAnimations() {
        // Get current active user IDs
        const activeUserIds = new Set(activeUsers.map((user) => user.id));

        // Remove animations and elements for users who are no longer active
        avatarAnimations.forEach((value, key) => {
            if (!activeUserIds.has(key)) {
                avatarAnimations.delete(key);
                avatarPositions.delete(key);
            }
        });

        // Add animations for new users
        activeUsers.forEach((user) => {
            if (!avatarAnimations.has(user.id)) {
                // Generate random positions and animation parameters
                const animationData = generateAvatarAnimation(user.id);
                avatarAnimations.set(user.id, animationData);
            }
        });

        // Ensure avatarElements array matches activeUsersWithAnimations length
        avatarElements.length = activeUsersWithAnimations.length;
    }

    function generateAvatarAnimation(id) {
        const seed = hashCode(id);

        const startX = randomInRange(0, window.innerWidth - 70, seed);
        const startY = randomInRange(0, window.innerHeight - 70, seed + 1);
        const speedX = randomInRange(50, 100, seed + 2);
        const speedY = randomInRange(50, 100, seed + 3);
        const directionX = seededRandom(seed + 4) < 0.5 ? 1 : -1;
        const directionY = seededRandom(seed + 5) < 0.5 ? 1 : -1;

        return {
            startX,
            startY,
            speedX,
            speedY,
            directionX,
            directionY
        };
    }

    // Helper function to generate a hash code from a string
    function hashCode(str) {
        let hash = 0;
        if (str.length === 0) return 1; // Avoid zero hash
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash) + 1; // Ensure hash is at least 1
    }

    // Helper function to generate a random number in a range using a seed
    function randomInRange(min, max, seed) {
        const random = seededRandom(seed);
        const adjustedRandom = random || 0.0001; // Ensure that random is never zero
        return min + adjustedRandom * (max - min);
    }

    // Seeded random number generator
    function seededRandom(seed) {
        // Using a Linear Congruential Generator (LCG) for better randomness
        const m = 0x80000000; // 2**31
        const a = 1103515245;
        const c = 12345;

        seed = (a * seed + c) % m;
        return seed / m;
    }

    let animationFrameId;

    function startAnimationLoop() {
        if (animationStarted) return;
        animationStarted = true;

        function animate() {
            activeUsersWithAnimations.forEach((user, index) => {
                let position = avatarPositions.get(user.id);
                if (!position) {
                    // Initialize position and velocity
                    position = {
                        x: user.animationData.startX,
                        y: user.animationData.startY,
                        vx: (user.animationData.speedX * user.animationData.directionX) / 60,
                        vy: (user.animationData.speedY * user.animationData.directionY) / 60
                    };
                    avatarPositions.set(user.id, position);
                }

                // Update position
                position.x += position.vx;
                position.y += position.vy;

                // Collision detection with viewport edges
                if (position.x <= 0) {
                    position.x = 0;
                    position.vx *= -1;
                } else if (position.x + 70 >= window.innerWidth) {
                    position.x = window.innerWidth - 70;
                    position.vx *= -1;
                }

                if (position.y <= 0) {
                    position.y = 0;
                    position.vy *= -1;
                } else if (position.y + 70 >= window.innerHeight) {
                    position.y = window.innerHeight - 70;
                    position.vy *= -1;
                }

                // Update the avatar's position
                const avatarElement = avatarElements[index];
                if (avatarElement) {
                    avatarElement.style.transform = `translate(${position.x}px, ${position.y}px)`;
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Stop the animation when the component is destroyed
    onDestroy(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });
</script>

<section class="ux-dash">
    <!-- Floating Avatars for Active Users -->
    <div class="floating-avatars">
        {#each activeUsersWithAnimations as user, index (user.id)}
            <div
                class="floating-avatar-wrapper"
                bind:this={avatarElements[index]}
            >
                <Avatar size="lg" src={user.avatarUrl} name={user.playerName} />
            </div>
        {/each}
    </div>

    <!-- Games and Top Players -->
    <div class="ux-dash__games">
        {#each gamesData as game}
            <div class="ux-dash__game ux-border">
                <div class="ux-dash__game-name ux-mb-1">{game.displayName}</div>
                <div class="ux-dash__game-scores">
                    {#each game.topPlayers as player, index}
                        <div class="ux-dash__game-score">
                            <div class="ux-dash__game-score-name">{index + 1}. {player.playerName}</div>
                            <hr class="ux-hr" />
                            <div class="ux-dash__game-score-value">{player.score}</div>
                        </div>
                    {/each}
                    <div class="ux-dash__avatars">
                        {#each game.topPlayers as player}
                            <Avatar size="sm" src={player.avatarUrl} name={player.playerName} />
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>
