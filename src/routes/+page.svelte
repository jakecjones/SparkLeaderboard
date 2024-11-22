<script>
	import '$lib/assets/styles/main.scss';
	import { onMount } from 'svelte';
	import { app } from '../firebase/config';
    import { getFirestore, onSnapshot, collection, query } from 'firebase/firestore';


    let db = getFirestore(app);

    const q = query(collection(db, 'games'));


	const games = [
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

    onMount(() => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, ' => ', doc.data());
            });
        });

        return () => unsubscribe();
    });
</script>

<section class="ux-dash">
	<div class="ux-dash__games">
		{#each games as game}
			<div class="ux-dash__game ux-border">
				<div class="ux-dash__game-name ux-mb-1">{game.displayName}</div>
				<div class="ux-dash__game-scores">
					<div class="ux-dash__game-score">
						<div class="ux-dash__game-score-name">Player 1</div>
						<div class="ux-dash__game-score-value">100</div>
					</div>
					<div class="ux-dash__game-score">
						<div class="ux-dash__game-score-name">Player 2</div>
						<div class="ux-dash__game-score-value">100</div>
					</div>
					<div class="ux-dash__game-score">
						<div class="ux-dash__game-score-name">Player 3</div>
						<div class="ux-dash__game-score-value">100</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style lang="scss">
    .ux-dash {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        background-image: url('../lib/assets/images/bg.png');
        background-size: contain;
        background-position: bottom center;
        background-repeat: no-repeat;
        position: relative;
        box-sizing: border-box;
    
        &__games {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            position: absolute;
            bottom: 10vh;
            width: 90%;
            font-size: 1.2rem;
    
            & > .ux-dash__game {
                width: 25vw;
                min-height: 30vh;
                height: auto;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                margin: 0 10px;
                padding: 2rem;
                border-radius: 5px;
                background-color: rgba(0, 0, 0, 0.98);
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
                box-sizing: border-box;
            }
        }
    
        &__game-name {
            // Add styles if needed
        }
    
        &__game-scores {
            display: flex;
            flex-direction: column;
            width: 100%;
        }
    
        &__game-score {
            display: flex;
            flex-direction: row;
            width: 100%;
            margin: 0.5rem 0;
            justify-content: space-between;
        }
    
        &__game-score-name {
            // Add styles if needed
        }
    
        &__game-score-value {
            // Add styles if needed
        }
    }
</style>
