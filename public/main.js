// 정규식: 알파벳과 숫자만 허용
const regex = /^[a-zA-Z0-9]{20,30}$/;
const regexN = /^[a-zA-Z0-9]{1,30}$/;
const regexP = /^(https?:\/\/)?playentry\.org\/project\/[a-zA-Z0-9]{20,30}$/;
const regexM = /^(https?:\/\/)?playentry\.org\/profile\/[a-zA-Z0-9]{20,30}$/;
const regexW = /^(https?:\/\/)?space\.playentry\.org\/world\/[a-zA-Z0-9]{20,30}$/;

var nickname = "";

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
            var projectURL;
            if($('#gridRadios2').is(':checked')){
                projectURL = document.getElementById('inputURL').value.split(/\/(project|study|community|following|follower|bookmark)/)[0];
            }else{
                console.log()
                projectURL = document.getElementById('inputURL').value;
            }
            
            nickname = document.getElementById('inputNickname').value;
            console.log(projectURL);
            var urlType;
            var regexURL;

            if ($('#gridRadios1').is(':checked')) {
                urlType = "project";
                regexURL = regexP;
            }
            if ($('#gridRadios2').is(':checked')) {
                urlType = "profile";
                regexURL = regexM;
            }
            if ($('#gridRadios3').is(':checked')) {
                urlType = "world";
                regexURL = regexW;
            }



            if (regexURL.test(projectURL)) {
                if (regexN.test(nickname)) {
                    //정상 작동하는지 확하고 복사
                    const nowTime = Date().toString();

                    const parts = projectURL.split('/');
                    const projectId = parts[parts.length - 1];

                    console.log(`프로젝트 ID: ${projectId}`);
                    console.log(`별명: ${nickname}`);
                    firebase.initializeApp(firebaseConfig);
                    const db = firebase.firestore();
                    db.collection('EntWork').doc(nickname).set({ id: projectId, time: nowTime, type: urlType }).then((result) => {
                        //저장 성공                    
                        $('#loadURL').hide();
                        $('#successURL').fadeIn();
                        
                        $('.copyURL').html('엔트리.org/' + nickname + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>');


                    }).catch((error) => {
                        //아마 이미 있는 문서인듯
                        $('#loadURL').hide();
                        $('#errorShow').show();
                        $('#errorTXT').html("중복된 별명인것 같습니다.<br>" + error.toString());
                        console.log("아니면 해킹을 시도하고 있거나...");


                    });

                } else {
                    $('#loadURL').hide();
                    $('#errorShow').show();
                    $('#errorTXT').html("옳바르지 않은 별명 입니다.");
                }



            } else {
                $('#loadURL').hide();
                $('#errorShow').show();
                $('#errorTXT').html('옳바르지 않은 주소 입니다.');
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
        console.log(result);
        var GoUrl = '';
        docRef.get().then((doc) => {
            if (doc.exists) {
                //주소 찾음
                const projectId = doc.data().id;
                const projectType = doc.data().type;

                
                if (projectType == "project") {
                    GoUrl = 'https://playentry.org/project/' + projectId;
                } else if (projectType == "profile") {
                    GoUrl = 'https://playentry.org/profile/' + projectId;
                } else if (projectType == "world") {
                    GoUrl = 'https://space.playentry.org/world/' + projectId;
                }

                if (GoUrl == '') {
                    //없는 주소
                    $('#loadURL').hide();
                    $('#errorShow').fadeIn();
                    $('#errorTXT').html("타입 오류");


                } else {
                    //글자수와 정규식 확인
                    const length = projectId.length
                    if (regex.test(projectId)) {
                        //단축 URL 이동
                        $('#loadURL').hide();
                        $('#moveURL').show();

                        console.log("Document data:", doc.data());
                        console.log("이동",GoUrl)
                        window.location.href = GoUrl;


                    } else {
                        //이상한 URL
                        $('#loadURL').hide();
                        $('#strangerURL').fadeIn();
                        $('.mainC').css('background','#FFFF00');      
                        $('#stranger').html('<a class="link-danger" href="'+GoUrl+'">"<xmp>' + GoUrl + '</xmp>"</a>로 이동하기');
                    }

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
    navigator.clipboard.writeText("엔트리.org/" + nickname).then(res => {
        $('.copyURL').html('엔트리.org/' + nickname + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"> <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>');
    }).catch((error) => {
        alert("주소가 복사실패" + error);
    })
});

