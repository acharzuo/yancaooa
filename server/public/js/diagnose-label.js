  function initTags(labels){
            // // 添加标签
        $(".tm-input").tagsManager({
            prefilled: labels?labels:["糖尿病", "高血压"],
            CapitalizeFirstLetter: false,  // 首字母大写
            // AjaxPush: apiUrl+"/api/pc/diagnostic-records/:id",
            AjaxPush: null,
            AjaxPushAllTags: null,
            AjaxPushParameters: null,
            delimiters: [9, 13, 44],
            backspace: [8],
            blinkBGColor_1: '#FFFF9C',
            blinkBGColor_2: '#CDE69C',
            hiddenTagListName: 'hiddenTagListA',
            hiddenTagListId: null,
            deleteTagsOnBackspace: false,
            tagsContainer: "#tagContainer",
            tagCloseIcon: '×',
            tagClass: '',
            validator: null,
            onlyTagList: false,
            maxTags:5,
            output: null,
            replace: false
        });

        $(".tm-input").on('tm:spliced', function(e, tag) {
            // alert(tag + " is almost removed!");
            // $("#tagEditor").css('display','none');
            var reportId = $("input[name='reportId']").val();
            updateLabel(reportId);
        });

        $(".tm-input").on('tm:hide', function(e, taglist) {
            $(".item3").css("maxWidth","80%");
        });

        $(".tm-input").on('tm:show', function(e, taglist) {
             $(".item3").css("maxWidth","60%");
        });

        $(".tm-input").on('tm:pushed', function(e, tag) {
            var reportId = $("input[name='reportId']").val();
            updateLabel(reportId);
        });

    }

    // 修改标签 逗号分隔 todo 改为数组
    function updateLabel(reportId){
        // var newTag = $('#tagEditor1').val();
        // if(newTag == ""){
        //     return;
        // }
        var labels = $(".tm-input").tagsManager('tags');
        // var labelStr = labels.join(',');
        var data = {label: labels};
        ytyApiAjax('/api/pc/diagnostic-records/'+reportId,'patch',data, function(err, reply){
        // ytyApiAjax('/api/pc/diagnostic-records','get',null, function(err, results){
            if(!err){
                console.log(reply);
            }else{
                alert('同步标签到服务器失败');
            }
        })
    }
    // $('#tagEditor1').on('change', function(e){
    //     // console.log('dfs');

    //     var newTag = $('#tagEditor1').val();
    //     if(newTag == ""){
    //         return;
    //     }
    //     console.log('add new tag '+ newTag);
    //      $(".tm-input").tagsManager("pushTag", newTag);
    //      var reportId = $("input[name='reportId']").val();
    //      updateLabel(reportId);
    //      $('#tagEditor1').val("");

    // })