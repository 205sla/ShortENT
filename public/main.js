// 정규식: 알파벳과 숫자만 허용
const regex = /^[a-zA-Z0-9]{20,30}$/;
const regexN = /^[a-zA-Z0-9]{1,30}$/;
const regexP = /^(https?:\/\/)?playentry\.org\/project\/[a-zA-Z0-9]{20,30}$/;

var nickname ="";

const path = window.location.pathname;
if (path == "/") {
    MainPage();

} else {
    //이동
    console.log(path);
    Redirect()
}


function MainPage() {

    //메인 페이지
    $('.mainPage').show();

    $('#CreateShortcutURL').on("click", function () {



        const IamRobot = $('#gridCheck1').is(':checked');
        $('.input-container').hide();
        $('.loading-container').show();

        console.log(IamRobot);

        if (IamRobot) {
            $('#loadURL').hide();
            $('#errorShow').show();
            $('#errorTXT').html("사람만 사용가능한 서비스 입니다.");

        } else {
            const projectURL = document.getElementById('inputURL').value;
            nickname = document.getElementById('inputNickname').value;



            if (regexP.test(projectURL)) {
                if (regexN.test(nickname)) {
                    //정상 작동하는지 확하고 복사
                    const nowTime = Date().toString();

                    const parts = projectURL.split('/');
                    const projectId = parts[parts.length - 1];

                    console.log(`프로젝트 ID: ${projectId}`);
                    console.log(`별명: ${nickname}`);
                    firebase.initializeApp(firebaseConfig);
                    const db = firebase.firestore();
                    db.collection('EntWork').doc(nickname).set({ id: projectId, time: nowTime }).then((result) => {
                        //저장 성공                    
                        $('#loadURL').hide();
                        $('#successURL').fadeIn();


                    }).catch((error) => {
                        //아마 이미 있는 문서인듯
                        $('#loadURL').hide();
                        $('#errorShow').show();
                        $('#errorTXT').html("중복된 별명인것 같습니다.<br>" + error.toString());
                        console.log("중복된 별명인것 같습니다.\n", error);


                    });

                } else {
                    $('#loadURL').hide();
                    $('#errorShow').show();
                    $('#errorTXT').html("옳바르지 않은 별명 입니다.");
                }



            } else {
                $('#loadURL').hide();
                $('#errorShow').show();
                $('#errorTXT').html('옳바르지 않은 작품 주소 입니다.');
            }

        }


    });


}


//짧은 링크로 이동
function Redirect() {

    //로딩 보이기
    $('.loading-container').show();


    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const db = firebase.firestore();
    // Firestore 데이터 접근
    document.addEventListener('DOMContentLoaded', () => {


        const result = path.split('/').filter(Boolean).pop();
        var docRef = db.collection("EntWork").doc(result);

        docRef.get().then((doc) => {
            if (doc.exists) {
                //주소 찾음
                const projectId = doc.data().id;

                //글자수와 정규식 확인
                const length = projectId.length
                if (regex.test(projectId)) {
                    //단축 URL 이동
                    $('#loadURL').hide();
                    $('#moveURL').show();

                    console.log("Document data:", doc.data());
                    window.location.href = 'https://playentry.org/project/' + projectId;

                } else {
                    //이상한 URL
                    $('#loadURL').hide();
                    $('#strangerURL').fadeIn();

                    $('#stranger').html('<a class="link-danger" href="https://playentry.org/project/" + ${projectId}>"https://playentry.org/project/' + projectId + '"</a>로 이동하기');
                }

            } else {
                //없는 주소
                $('#loadURL').hide();
                $('#errorURL').fadeIn();

                console.log("No such document!");
            }
        }).catch((error) => {
            //errorShow
            $('#loadURL').hide();
            $('#errorShow').fadeIn();
            $('#errorTXT').html(error.toString());
            console.log("Error getting document:", error);
        });
    });



}


$('.GoMainPage').on("click", function () {
    console.log("go main")
    window.location.href = window.location.origin;

});

$('.copyURL').on("click", function () {
    console.log("go main")
    navigator.clipboard.writeText("엔트리.org/"+nickname).then(res=>{
        alert("주소가 복사되었습니다!");
    }).catch((error)=>{
        alert("주소가 복사실패"+error);
    })
});

