// Your web app's Firebase configuration


const path = window.location.pathname;
if (path == "/") {
    function validateAndSubmit() {
        const projectId = document.getElementById('projectId').value;
        const nickname = document.getElementById('nickname').value;

        // 정규식: 알파벳과 숫자만 허용
        const regex = /^[a-zA-Z0-9]+$/;

        if (regex.test(projectId)) {
            console.log(`프로젝트 ID: ${projectId}`);
            console.log(`별명: ${nickname}`);
            firebase.initializeApp(firebaseConfig);
            const db = firebase.firestore();
            db.collection('EntWork').doc(nickname).set({id : projectId})
        } else {
            console.error('프로젝트 ID는 알파벳과 숫자만 포함해야 합니다.');
        }
    }


    //firebase.initializeApp(firebaseConfig);
    //const db = firebase.firestore();
    //db.collection('EntWork').doc('0205').set({id : '562218f87875f9863f02262d'})

} else {
    console.log(path);
    Redirect()
}





function Redirect() {

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();
    // Firestore 데이터 접근
    document.addEventListener('DOMContentLoaded', () => {


        const result = path.split('/').filter(Boolean).pop();
        var docRef = db.collection("EntWork").doc(result);

        docRef.get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                window.location.href = 'https://playentry.org/project/' + doc.data().id;
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    });




    console.log("ddd")

}
