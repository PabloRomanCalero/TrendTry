
const mediaContainer = document.getElementById('containerMedia');
const y = 0;
let token = document.querySelector('[name=_token]').value;



listarMedia = async () => {
    mediaContainer.innerHTML = '';

    let likedMedia = JSON.parse(localStorage.getItem('likedMedia')) || [];

    /* likedMedia = [];
    localStorage.setItem('likedMedia', JSON.stringify(likedMedia)); */ 

    let respMedia = await fetch('api/media/exceptMedia');
    let mediaJson = await respMedia.json();
    console.log(mediaJson);

    await mediaJson.forEach(async (media) => {
        let userMediaData = await fetch(`api/users/viewUserMedia/${media.user_id}`)
        let userMediaJson = await userMediaData.json();
        let userMedia = userMediaJson[0];

        let respMediaProduct = await fetch(`api/product/mediaProduct/${media.product_id}`);
        let mediaProduct = await respMediaProduct.json();
        let product = mediaProduct[0];

        const mediaElement = document.createElement('div');
        mediaElement.classList.add('media');

        const profileMediaElement = document.createElement('div');
        profileMediaElement.classList.add('userMediaDiv');
        const profileMedia = document.createElement('div');
        profileMedia.classList.add('profileMedia');
        profileMedia.innerHTML = userMedia.username;

        const divVideoElement = document.createElement('div');
        divVideoElement.classList.add('divVideoImagen');

        const hr = document.createElement('hr');
        hr.style.width = '92%';
        hr.style.borderTop = '1px solid #ccc';

        const contentElement = document.createElement('div');
        contentElement.classList.add('media-content');

        const mediaFunctions = document.createElement('div');
        mediaFunctions.classList.add('media-functions');

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = media.description;

        // Botón de "Me gusta"
        const likeButton = document.createElement('button');
        likeButton.innerHTML = '<i class="fas fa-heart"></i>';
        likeButton.classList.add('like-button');

        likeButton.onclick = async function () {
            
            if (!likedMedia.includes(media.id)) {//Si no está en likedMedia se hace y se pushea el id para no poder hacerlo otra vez.  
                let likes = media.likes + 1;
                let likesResp = await fetch('api/media/likesByMedia', {
                    method: 'PUT',
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "likes": likes, "media_id": media.id }),
                });
                
                const likeCount = this.parentElement.querySelector('.like-count');
                if (likesResp.status === 200) {
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                    likedMedia.push(media.id);
                    localStorage.setItem('likedMedia', JSON.stringify(likedMedia));

                    $userId = media.user_id;
                    await fetch('api/crearDescuento', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': token,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "user_id": media.user_id})
                    }); 
                }
                
            }
        };
        const likesElement = document.createElement('p');
        likesElement.innerHTML = `<span class="like-count">${media.likes}</span>`;

        //Comments elements
        const commentButton = document.createElement('button');
        commentButton.innerHTML = '<i class="fas fa-comment"></i>';
        commentButton.classList.add('comment-button');

        const commentsElement = document.createElement('p');
        commentsElement.innerHTML = `<span class="comment-count">0</span>`;

        const productName = document.createElement('p');
        productName.innerHTML = `<strong>Prenda:</strong> ${product.name}`;

        //Div comentarios y formComentarios

        const divComments = document.createElement('div');
        divComments.classList.add('divComments')

        //Sacar comentarios del media y crear divs dinamicos
        let commentsMedia = await fetch('api/comments/mediaComments', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "media_id": media.id }),
        });
        let commentsJson = await commentsMedia.json();
        let i = 1;

        if (commentsJson != 0) {
            await commentsJson.forEach(commentsArray => {
                commentsArray.forEach(async comment => {
                    let userCommentResp = await fetch(`api/users/viewUserMedia/${comment.user_id}`)
                    let userJson = await userCommentResp.json();
                    let userComment = userJson[0];
                    const commentDiv = document.createElement('div');
                    commentDiv.classList.add('comment');
                    const imageUserComment = document.createElement('div');
                    imageUserComment.classList.add('imageUserComment');
                    const profileImageComment = document.createElement('img');
                    profileImageComment.src = `${userComment.profile_photo}`; 
                    profileImageComment.alt = 'Profile Image'; 
                    imageUserComment.appendChild(profileImageComment);

                    const commentInfo = document.createElement('span');
                    commentInfo.classList.add('commentInfo');
                    commentInfo.textContent = `${userComment.username}: ${comment.comment}`;
                    
                    commentDiv.appendChild(imageUserComment);
                    commentDiv.appendChild(commentInfo);
                    commentsElement.innerHTML = `<span class="comment-count">${i}</span>`;
                    divComments.appendChild(commentDiv);
                    i++;
                });
            });
        }


        const input = document.createElement('input');
        input.classList.add('inputComment');
        input.type = 'text';
        input.placeholder = 'Escribir comentario';
        const button = document.createElement('button');
        button.classList.add('botonCrearComment');
        button.type = 'submit';


        divComments.appendChild(input);
        divComments.appendChild(button);

        //Formulario de comentarios
        commentButton.onclick = function () {
            divComments.style.display = 'block';
        };

        //Crear commentario cuando se envia el input
        input.addEventListener('keypress', async function (event) {
            if (event.key === 'Enter') {
                
                await fetch('api/comments/createComment', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "media_id": media.id, "comment": input.value }),
                });
                input.value = '';
                window.location.reload();
            }
            
        });

        mediaFunctions.appendChild(likeButton);
        mediaFunctions.appendChild(likesElement);
        mediaFunctions.appendChild(commentButton);
        mediaFunctions.appendChild(commentsElement);
        contentElement.appendChild(mediaFunctions);
        contentElement.appendChild(descriptionElement);
        contentElement.appendChild(productName);
        contentElement.appendChild(divComments);

        profileMediaElement.appendChild(profileMedia);
        mediaElement.appendChild(profileMediaElement);
        if (media.url.toLowerCase().endsWith('.mp4')) {
            const videoElement = document.createElement('video');
            videoElement.classList.add('videoMedia');
            videoElement.controls = true;
            videoElement.src = media.url;
            divVideoElement.appendChild(videoElement);
            mediaElement.appendChild(divVideoElement);
        } else {
            const imageElement = document.createElement('img');
            imageElement.classList.add('imagenesMedia');
            imageElement.src = media.url;
            imageElement.alt = 'Media';
            divVideoElement.appendChild(imageElement);
            mediaElement.appendChild(divVideoElement);
        }

        mediaElement.appendChild(hr);
        mediaElement.appendChild(contentElement);
        mediaContainer.appendChild(mediaElement);
    });
};

window.onload = async () => {
    await listarMedia(); 
};
