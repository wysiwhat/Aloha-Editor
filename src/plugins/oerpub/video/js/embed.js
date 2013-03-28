function ytVidId(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
}

function test(url) {
	test_url = http://www.youtube.com/watch?v=_K46OCFPjHU;
	console.log(ytVidId(url));
}
