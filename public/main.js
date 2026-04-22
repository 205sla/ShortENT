// 정규식: 알파벳과 숫자만 허용
const regex = /^[a-zA-Z0-9]{20,30}$/;
const regexN = /^[\uAC00-\uD7A3a-zA-Z0-9]{1,30}$/;
const regexP = /^(https?:\/\/)?playentry\.org\/project\/[a-zA-Z0-9]{20,30}$/;
const regexM = /^(https?:\/\/)?playentry\.org\/profile\/[a-zA-Z0-9]{20,30}$/;
const regexW = /^(https?:\/\/)?space\.playentry\.org\/world\/[a-zA-Z0-9]{20,30}$/;
const regexT = /^(https?:\/\/)?playentry\.org\/community\/tips\/[a-zA-Z0-9]{20,30}$/;

// Firebase는 /__/firebase/init.js 에서 자동 초기화됨 (Firebase Hosting 예약 경로)
const db = firebase.firestore();

const path = window.location.pathname;

if (path === "/") {
    MainPage();
} else {
    Redirect();
}


function MainPage() {
    let nickname = "";

    $('.mainPage').show();

    const placeholders = {
        gridRadios1: "https://playentry.org/project/...",
        gridRadios2: "https://playentry.org/profile/...",
        gridRadios3: "https://space.playentry.org/world/...",
        gridRadios4: "https://playentry.org/community/tips/..."
    };

    $('input[name="gridRadios"]').on("change", function () {
        $('#inputURL').attr('placeholder', placeholders[this.id]);
    });

    $('#CreateShortcutURL').on("click", function () {
        const IamRobot = $('#gridCheck1').is(':checked');
        $('.input-container').hide();
        $('.loading-container').show();

        if (IamRobot) {
            $('#loadURL').hide();
            $('#errorShow').show();
            $('#errorTXT').text("사람만 사용가능한 서비스 입니다.");
            return;
        }

        let projectURL = $('#inputURL').val().split(/[?#]/)[0];
        if ($('#gridRadios2').is(':checked')) {
            projectURL = projectURL.split(/\/(project|study|community|following|follower|bookmark)/)[0];
        }

        nickname = $('#inputNickname').val();

        let urlType;
        let regexURL;

        if ($('#gridRadios1').is(':checked')) {
            urlType = "project";
            regexURL = regexP;
        } else if ($('#gridRadios2').is(':checked')) {
            urlType = "profile";
            regexURL = regexM;
        } else if ($('#gridRadios3').is(':checked')) {
            urlType = "world";
            regexURL = regexW;
        } else if ($('#gridRadios4').is(':checked')) {
            urlType = "tips";
            regexURL = regexT;
        }

        if (!regexURL.test(projectURL)) {
            $('#loadURL').hide();
            $('#errorShow').show();
            $('#errorTXT').text('올바르지 않은 주소 입니다.');
            return;
        }

        if (!regexN.test(nickname)) {
            $('#loadURL').hide();
            $('#errorShow').show();
            $('#errorTXT').text("올바르지 않은 별명 입니다.");
            return;
        }

        const nowTime = new Date().toISOString();
        const parts = projectURL.split('/');
        const projectId = parts[parts.length - 1];
        const docId = punycode.toASCII(nickname);

        db.collection('EntWork').doc(docId).set({
            id: projectId,
            time: nowTime,
            type: urlType
        }).then(() => {
            $('#loadURL').hide();
            $('#successURL').fadeIn();
            $('.copyURL').html('엔트리.org/' + nickname + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/></svg>');
        }).catch(() => {
            $('#loadURL').hide();
            $('#errorShow').show();
            $('#errorTXT').text("중복된 별명인것 같습니다.");
        });
    });

    $('.copyURL').on("click", function () {
        navigator.clipboard.writeText("엔트리.org/" + nickname).then(() => {
            $('.copyURL').html('엔트리.org/' + nickname + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"> <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/></svg>');
        }).catch((error) => {
            alert("주소 복사 실패: " + error);
        });
    });
}


// 짧은 링크로 이동
function Redirect() {
    $('.loading-container').show();

    const result = decodeURIComponent(path.split('/').filter(Boolean).pop());
    const lookupKey = punycode.toASCII(result);
    const docRef = db.collection("EntWork").doc(lookupKey);

    docRef.get().then((doc) => {
        if (!doc.exists) {
            $('#loadURL').hide();
            $('#errorURL').fadeIn();
            return;
        }

        const projectId = doc.data().id;
        const projectType = doc.data().type;

        let GoUrl = '';
        if (projectType === "project") {
            GoUrl = 'https://playentry.org/project/' + projectId;
        } else if (projectType === "profile") {
            GoUrl = 'https://playentry.org/profile/' + projectId;
        } else if (projectType === "world") {
            GoUrl = 'https://space.playentry.org/world/' + projectId;
        } else if (projectType === "tips") {
            GoUrl = 'https://playentry.org/community/tips/' + projectId;
        }

        if (GoUrl === '') {
            $('#loadURL').hide();
            $('#errorShow').fadeIn();
            $('#errorTXT').text("타입 오류");
        } else if (regex.test(projectId)) {
            $('#loadURL').hide();
            $('#moveURL').show();
            setTimeout(() => {
                window.location.href = GoUrl;
            }, 1000);
        } else {
            $('#loadURL').hide();
            $('#strangerURL').fadeIn();
            $('.mainC').css('background', '#FFFF00');
            const $link = $('<a>').addClass('link-danger').attr('href', GoUrl).text(GoUrl);
            $('#stranger').empty().append('"').append($link).append('"로 이동하기');
        }
    }).catch((error) => {
        $('#loadURL').hide();
        $('#errorShow').fadeIn();
        $('#errorTXT').text(error.toString());
    });
}


$('.GoMainPage').on("click", function () {
    window.location.href = window.location.origin;
});
