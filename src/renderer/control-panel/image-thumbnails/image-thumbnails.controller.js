angular.module('app.controlPanel')
	.controller('ImageThumbnailsController', [
		'$element',

		function ImageThumbnailsCtrl(
			$element,
		) {
			const vm = this,
				/** @type {HTMLElement} */
				element = $element[0];

			/** @type {HTMLElement} */
			let scrollableAreaElement;
			/** @type {HTMLElement} */
			let thumbnailListElement;
			/** @type {Object[]} */
			let thumbnailList = [
				// { src: require('../../img/0.png'), },
				// { src: require('../../img/1.jpg'), },
				// { src: require('../../img/2.jpg'), },
				// { src: require('../../img/3.jpg'), },
				// { src: require('../../img/4.jpg'), },
				// { src: require('../../img/5.jpg'), },
				// { src: require('../../img/6.jpg'), },
				// { src: require('../../img/7.jpg'), },
				// { src: require('../../img/8.jpg'), },
				// { src: require('../../img/9.jpg'), },
			];

			Object.assign(vm, {
				thumbnailList,
				$postLink,
			});

			function _setUpScrollWheelHelper() {
				scrollableAreaElement = element.querySelector('#scrollableArea');
				scrollableAreaElement.addEventListener('wheel', function wheelEventForElement(event) {
					const { deltaY } = event;
					if (deltaY !== 0) {
						scrollableAreaElement.scrollLeft += deltaY;
					}
				});
			}

			function _setUpNativeDragAndDrop() {
				thumbnailListElement = element.querySelector('#thumbnailList');

				const CSS_CLASSES = {
					BEING_DRAGGED: 'is-dragged',
					ACCEPTS_DROP: 'accepts-drop'
				};

				let itemCurrentlyDragged = null;

				thumbnailListElement.addEventListener('dragstart', function dragStartListener(event) {
					const { target } = event;
					itemCurrentlyDragged = target;
					event.stopPropagation();
					target.classList.add(CSS_CLASSES.BEING_DRAGGED);
					event.dataTransfer.effectAllowed = 'move';
				});
				thumbnailListElement.addEventListener('dragend', function dragEndListener(event) {
					itemCurrentlyDragged = null;
					const { target } = event;
					target.classList.remove(CSS_CLASSES.BEING_DRAGGED);
				});
				thumbnailListElement.addEventListener('dragover', function dragOverListener(event) {
					if (event.target === itemCurrentlyDragged) return;
					event.preventDefault(); // Required allow us to drop
					event.dataTransfer.dropEffect = 'move';
				});
				thumbnailListElement.addEventListener('dragenter', function dragEnterListener(event) {
					const { target } = event;
					if (target === itemCurrentlyDragged) return;
					target.classList.add(CSS_CLASSES.ACCEPTS_DROP);
				});
				thumbnailListElement.addEventListener('dragleave', function dragLeaveListener(event) {
					let { target } = event;
					target.classList.remove(CSS_CLASSES.ACCEPTS_DROP);
				});
				thumbnailListElement.addEventListener('drop', function dropListener(event) {
					const { target } = event;

					let sourceImg = itemCurrentlyDragged.querySelector('img'),
						targetImg = target.querySelector('img'),
						targetImgUrl = targetImg.src;

					// interchange image urls
					targetImg.src = sourceImg.src;
					sourceImg.src = targetImgUrl;
					target.classList.remove(CSS_CLASSES.ACCEPTS_DROP);
				});
			}

			/**
			 * Called after this controller's element and its children have been linked. Similar to the post-link
			 * function this hook can be used to set up DOM event handlers and do direct DOM manipulation.
			 */
			function $postLink() {
				_setUpScrollWheelHelper();
				_setUpNativeDragAndDrop();
			}
		}
	]);
