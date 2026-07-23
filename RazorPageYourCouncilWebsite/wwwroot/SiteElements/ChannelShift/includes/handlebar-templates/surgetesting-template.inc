<script src='/SiteElements/ChannelShift/Scripts/services/surgetesting/surgetestingservices.js'></script>
<script id="surge-testing-template" type="text/x-handlebars-template">
	{{#if apidata.Active}}
        <strong class="targeted-area">You are in a targeted area</strong>
        <p>You are in the targeted area, and should be tested <strong>even if you are not showing symptoms</strong>.</p>
<p>Information about how to get tested with link to booking</p>
<p>Please observe all the national (and local) restrictions and remember Hands, Face, Space safety precautions at all times.</p>
<p><a href="https://www.gov.uk/coronavirus">Check the latest advice on&nbsp;coronavirus</a></p>
    {{else }}
    <p style="margin-top: 40px;">
        <strong>{{ apidata.PostCode }}&nbsp;&nbsp;</strong> is not currently in an area identified for enhanced testing, however please continue to take care, remembering hands, face, space, and fresh air.
    </p>
    {{/if}}

</script>
<style type="text/css">
	.grid-block {
		width: 170px;
		border: 0 solid red;
		height: 170px;
		display: inline;
		float: left;
		margin-right: 30px;
	}

	div.surge-testing-container {
		background-color: #b3bd00;
		height: 170px;
	}

	.surge-testing-container .home-outline {
		margin: 0;
		padding: 0;
		position: relative;
	}

	.surge-testing-container div.img-placeholder {
		background: url(/SiteElements/ChannelShift/content/images/your-area/yourareaicon.svg) no-repeat;
		background-size: 90px 138px;
		height: 150px;
		float: left;
		position: relative;
		top: 17px;
		left: 40px;
	}

	.surge-testing-container .home-outline {
		margin-top: 35px;
	}

	.surge-testing-container .home-outline h3.home-h3 {
		margin-top: 50px;
	}

	.surge-testing-container #image-box {
		max-width: 190px;
		width: 70%;
		height: 140px;
		float: left;
	}

	.surge-testing-container #text-box {
		float: left;
		width: calc(100% - 200px);
		max-width: 970px;
	}

	.surge-testing-container .surge-testing-text-box {
		padding-right: 0;
		position: relative;
	}

	.surge-testing-container .my-area-input-box {
		padding-left: 0;
		margin-top: 4px;
	}

	.surge-testing-container .home-outline span {
		margin: auto;
		left: 0;
		float: left;
	}

	.surge-testing-container .input-group {
		text-align: center;
		margin-top: 5px;
		margin-left: 0;
		margin-right: 0;
		display: inline-block;
		min-width: 200px;
	}

	.surge-testing-container button {
		color: #fff;
		text-transform: uppercase;
		background-color: #830065;
		border: 1px solid #b5bd00;
		height: 52px;
		width: 55px;
	}

	#surge-testing-input {
		height: 52px;
		width: 180px;
		border: 1px solid #b5bd00;
		font-size: 24px;
	}



	div.image-container {
		float: left;
		min-width: 100px;
		display: inline;
		padding-right: 10px;
	}

	strong.targeted-area {
		text-align: center;
		display: block;
		margin-top: 20px;
		margin-bottom: 20px;
		color: red;
		font-weight: bold;
		font-size: 1.9em;
	}


	@media (min-width: 1170px) and (max-width: 9000px) {
		.surge-testing-container .home-outline {
			margin-top: 20px;
		}

		div#where-is-my-nearest-container {
			border: 0 solid red;
		}


		.surge-testing-container .surge-testing-text-box {
			width: 480px;
			max-width: 480px;
		}
	}

	@media (min-width: 300px) and (max-width: 1169px) {
		.surge-testing-container #text-box {
			border: 0 solid red;

		}
	}


	@media (max-width: 992px) {
		.middle-col-padding {
			padding-left: 0;
			padding-right: 0;
		}

		div.surge-testing-container {
			height: 100%;
		}

		#text-box .col-md-5 {
			width: 100%;
		}

		.surge-testing-container .surge-testing-input-box {
			width: 100%;
			text-align: center;
			margin-top: 5px;
		}

		.surge-testing-container .surge-testing-text-box {
			width: 100%;
			text-align: center;
			margin: auto;
		}

		.surge-testing-container .home-outline {
			margin-top: 15px;
			text-align: center;
		}

		.surge-testing-container .home-outline span.input-group-btn {
			width: 55px;
			position: relative;
			left: -1px;
		}

		div#myarea-container div.panel-heading h3 {
			color: #fff;
		}
	}


	@media screen and (max-width: 768px) {
		#surge-testing-input {
			height: 40px;
		}

		.surge-testing-container button {
			color: #fff;
			height: 40px;
			width: 55px;
		}

		.surge-testing-container .input-group {
			margin-top: 10px;
			width: 310px;
		}

		.surge-testing-container .surge-testing-text-box {
			width: 100%;
			max-width: 100%;
			margin-top: 4px;
		}

		.surge-testing-input-box {
			width: 100%;
			max-width: 100%;
			text-align: center;
		}

		#text-box .col-md-5 {
			width: 100%;
		}

		.middle-col-padding {
			padding-left: 0;
			padding-right: 0;
		}

		.surge-testing-container div#image-box {
			max-width: 0;
			width: 0;
		}

		.surge-testing-container div#text-box {
			width: 100%;
			max-width: 100%;
			border: 0 solid #00f;
			display: inline-block;
			float: none;
		}

		div#image-box-container.grid-block {
			display: none;
		}

		div.surge-testing-container {
			height: auto;
			padding-bottom: 10px;
		}

		.surge-testing-container div.img-placeholder {
			background: url("");
			background-size: 0 0;
			margin: auto;
			text-align: center;
			width: 100%;
		}

		.surge-testing-container .home-outline {
			text-align: center;
			margin: 0 5px;
		}

		.surge-testing-container .home-outline span {
			float: none;
		}
	}

	@media screen and (max-width: 480px) {


		.surge-testing-container {
			min-height: 180px;
		}

		.surge-testing-container .surge-testing-input-box {
			margin-top: 10px;
		}

		.surge-testing-container .input-group {
			width: 270px;
			text-align: center;
			margin: auto;
		}


		.surge-testing-container .home-outline {
			margin-top: 20px;
		}
	}
</style>