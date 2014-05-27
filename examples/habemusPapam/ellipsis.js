var elVis = n3.vis('habemusPapam')
    .stage('#tableauViz', 1000, 475)

    .state('country', ['Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia-Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burma (Myanmar)', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic', 'Chad', 'Channel Islands', 'Chile', 'China', 'Colombia', 'Comoros', 'Cook Islands', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'DRC', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Faeroe Islands', 'Falkland Islands', 'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 'Guatemala', 'Guinea', 'Guinea Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Montserrat', 'Morocco', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'Netherlands Antilles', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Korea', 'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestinian territories', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Republic of Macedonia', 'Republic of the Congo', 'Reunion', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'St. Helena', 'St. Kitts and Nevis', 'St. Lucia', 'St. Pierre and Miquelon', 'St. Vincent and the Grenadines', 'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Turks and Caicos', 'Tuvalu', 'U.S. Virgin Islands', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Wallis and Futuna', 'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe'])
    .render(function() {
        var countries = elVis.state('country').split(', ');
        if(countries.length == 1 && countries[0] == '')
            map.clearSelectedMarksAsync()
        else
            map.selectMarksAsync('Country', countries, tableauSoftware.SelectionUpdateType.REPLACE);
    });


n3.scene('overview')
    .add(elVis, 
            n3.annotation('label')
                .attr('id', 'cardinals')
                .attr('class', 'label')
                .html('<a href="#" onclick="n3.timeline.switchScene(\'cardinals\');">The College of Cardinals</a>')
                .pos([327, 125]))

    .add(elVis, 
            n3.annotation('label')
                .attr('id', 'pope')
                .attr('class', 'label')
                .html('<a href="#" onclick="n3.timeline.switchScene(\'francis\');">Pope Francis</a>')
                .pos([150, 417]))

n3.scene('overview').clone('cardinals')
    .set(elVis, 'country', '')

    .add(elVis,
            n3.annotation('label')
                .html("<h2>The College of Cardinals</h2>" + 
                    "<p>115 cardinals participated in the 2013 Conclave. " +
                    "However, most of them were from Europe. " +
                    "This is in spite of the church's shifting demographics " +
                    "(click for more info):</p>" + 
                    "<table>" + 
                    "<thead onclick=\"n3.timeline.switchScene('cardinals')\"><tr><th>&nbsp;</th><th>% Total Catholics</th><th>% of Cardinals</th></tr></thead>" + 
                    "<tbody>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('europe');\">Europe</a></td><td>26</td><td>62<td></tr>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('latin_america');\">Latin America</a></td><td>33</td><td>19<td></tr>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('north_america');\">North America</a></td><td>16</td><td>14<td></tr>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('africa');\">Africa</a></td><td>13</td><td>11<td></tr>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('asia');\">Asia</a></td><td>11</td><td>11<td></tr>" + 
                    "<tr><td class=\"country\"><a href=\"#\" onclick=\"n3.timeline.switchScene('oceania');\">Oceania</a></td><td>1</td><td>1<td></tr>" +
                    "</tbody></table>" + 
                    "<div class=\"close\" onclick=\"n3.timeline.switchScene('overview')\">x</div>")
                .pos([702, 34])
                .attr('id', 'label_1364620620916')
                .attr('class', 'annotation')
                .style('width', '305px'))

n3.scene('cardinals').clone('europe')
    .set('habemusPapam', 'country', 'Albania, Andorra, Armenia, Austria, Belarus, Belgium, Bosnia-Herzegovina, Bulgaria, Channel Islands, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Faeroe Islands, Finland, France, Georgia, Germany, Gibraltar, Greece, Greenland, Hungary, Iceland, Ireland, Isle of Man, Italy, Kosovo, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Moldova, Monaco, Montenegro, Netherlands, Norway, Poland, Portugal, Republic of Macedonia, Romania, Russia, San Marino, Serbia, Slovakia, Slovenia, Spain, Sweden, Switzerland, Ukraine, United Kingdom, Uzbekistan, Vatican City')

n3.scene('cardinals').clone('asia')
    .set('habemusPapam', 'country', 'Afghanistan, Azerbaijan, Bahrain, Bangladesh, Bhutan, Brunei, Burma (Myanmar), Cambodia, China, Hong Kong, India, Indonesia, Iran, Iraq, Israel, Japan, Jordan, Kazakhstan, Kuwait, Kyrgyzstan, Laos, Lebanon, Macau, Malaysia, Maldives, Mongolia, Nepal, North Korea, Oman, Pakistan, Palestinian territories, Philippines, Qatar, Saudi Arabia, Singapore, South Korea, Sri Lanka, Syria, Taiwan, Tajikistan, Thailand, Timor-Leste, Turkey, Turkmenistan, United Arab Emirates, Vietnam, Yemen')

n3.scene('cardinals').clone('africa')
    .set('habemusPapam', 'country', 'Algeria, Angola, Benin, Botswana, Burkina Faso, Burundi, Cameroon, Cape Verde, Central African Republic, Chad, Comoros, Djibouti, DRC, Egypt, Equatorial Guinea, Eritrea, Ethiopia, Gabon, Gambia, Ghana, Guinea, Guinea Bissau, Ivory Coast, Kenya, Lesotho, Liberia, Libya, Madagascar, Malawi, Mali, Mauritania, Mauritius, Mayotte, Morocco, Mozambique, Namibia, Niger, Nigeria, Republic of the Congo, Reunion, Rwanda, Sao Tome and Principe, Senegal, Seychelles, Sierra Leone, Somalia, South Africa, South Sudan, Sudan, Swaziland, Tanzania, Togo, Tunisia, Uganda, Western Sahara, Zambia, Zimbabwe')

    .add('habemusPapam', 
         n3.annotation('label')
                .html('<blockquote><p>Catholicism’s growth in Africa has accelerated in recent decades. There was a groundswell after the '+
                    'Second Vatican Council of 1962-65, which authorised the use of vernacular at mass and delegated more power to locals.'+
                    'The church’s indigenisation proceeded. African song and dance were incorporated into services. Young African priests, '+
                    'not European missionaries, took charge.</p></blockquote>' + 
                     '<p>More information at <a href="http://www.economist.com/news/middle-east-and-africa/21573599-vatican-franchise-going-strong-despite-fierce-competition-boomtown-church">The Economist</a></p>' + 
                     "<div class=\"close\" onclick=\"n3.timeline.switchScene('cardinals')\">x</div>")
                .pos([702, 256])
                .attr('id', 'label_1364760621063')
                .attr('class', 'annotation')
                .style('width', '305px'))

n3.scene('cardinals').clone('north_america')
    .set('habemusPapam', 'country', 'Canada, United States')

n3.scene('cardinals').clone('latin_america')
    .set('habemusPapam', 'country', 'Anguilla, Antigua and Barbuda, Argentina, Aruba, Bahamas, Barbados, Belize, Bermuda, Bolivia, Brazil, British Virgin Islands, Cayman Islands, Chile, Colombia, Costa Rica, Cuba, Dominica, Dominican Republic, Ecuador, El Salvador, Falkland Islands, French Guiana, Grenada, Guadeloupe, Guatemala, Guyana, Haiti, Honduras, Jamaica, Martinique, Mexico, Montserrat, Netherlands Antilles, Nicaragua, Panama, Paraguay, Peru, Puerto Rico, St. Helena, St. Kitts and Nevis, St. Lucia, St. Pierre and Miquelon, St. Vincent and the Grenadines, Suriname, Trinidad and Tobago, Turks and Caicos, U.S. Virgin Islands, Uruguay, Venezuela')

    .add('habemusPapam', 
         n3.annotation('label')
                .html('<blockquote><p>Although the Vatican had once seen the area as a “continent of hope,”' + 
                    " it now thought of it as a “continent of concern.”</p>" + 
                    "<p>According to Brazil’s 2010 census, 65 percent of the population is Catholic, down from" + 
                    "over 90 percent in 1970. Similarly, between 2000 and 2010, the percentage of Mexicans that identify" + 
                    "as Catholic dropped from 88 to less than 83 -- the largest fall recorded to date. If these trends persist, " +
                     'by 2025 about 50 percent of all Latin Americans will be Catholic, down from approximately 70 percent today".</p></blockquote>' + 
                     '<p>More information at <a href="https://www.foreignaffairs.com/articles/139066/omar-encarnacion/the-catholic-crisis-in-latin-america">Foreign Affairs</a></p>' + 
                     "<div class=\"close\" onclick=\"n3.timeline.switchScene('cardinals')\">x</div>")
                .pos([702, 256])
                .attr('id', 'label_1364760621063')
                .attr('class', 'annotation')
                .style('width', '305px'))

n3.scene('cardinals').clone('oceania')
    .set('habemusPapam', 'country', 'American Samoa, Australia, Cook Islands, Fiji, French Polynesia, Guam, Kiribati, Marshall Islands, Micronesia, Nauru, New Caledonia, New Zealand, Niue, Northern Mariana Islands, Palau, Papua New Guinea, Samoa, Solomon Islands, Tokelau, Tonga, Tuvalu, Vanuatu, Wallis and Futuna')

n3.scene('overview').clone('francis')
    .set(elVis, 'country', 'Argentina, Philippines, Hungary, Ghana, Sri Lanka, Brazil, Italy, Canada, Honduras, United States, Austria, Vatican')

    .add(elVis,
            n3.annotation('label')
                .html("<h2>Pope Francis</h2>" + 
                    "<p>Perhaps the shift in the Catholic demographic weighed " +
                    "on the cardinals? Pope Francis, formerly Cardinal " + 
                    "Bergoglio of Argentina, is the first non-European pope " + 
                    "in over 1,200 years, and the first Jesuit.</p>" + 
                    "<p>Other reported frontrunners included:</p>" + 
                    "<table>" + 
                    '<tr><td>Luis Tagale</td><td class="country">Philippines</td><td class="external"><a href="http://talkingpointsmemo.com/news/filipino-cardinal-stirs-papal-talk-with-rapid-rise.php">More Info</a></td></tr>' + 
                    '<tr><td>Peter Erdo</td><td class="country">Hungary</td><td class="external"><a href="http://talkingpointsmemo.com/news/hungary-cardinals-parents-defied-communism.php">More Info</a></td></tr>' + 
                    '<tr><td>Peter Turkson</td><td class="country">Ghana</td><td class="external"><a href="http://talkingpointsmemo.com/news/cardinal-turkson-is-africas-best-hope-for-pope.php">More Info</a></td></tr>' + 
                    '<tr><td>Malcolm Ranjith</td><td class="country">Sri Lanka</td><td class="external"><a href="http://talkingpointsmemo.com/news/sri-lanka-cardinal-papal-race.php">More Info</a></td></tr>' + 
                    '<tr><td>Odilo Scherer</td><td class="country">Brazil</td><td class="external"><a href="http://talkingpointsmemo.com/news/brazil-cardinal-scherer-pope-contender.php">More Info</a></td></tr>' + 
                    '<tr><td>Angelo Scola</td><td class="country">Milan</td><td class="external"><a href="http://talkingpointsmemo.com/news/scola-reaches-youth-through-kerouac-and-mccarthy.php">More Info</a></td></tr>' + 
                    '<tr><td>Marc Ouellet</td><td class="country">Canada</td><td class="external"><a href="http://talkingpointsmemo.com/news/conservative-canadian-a-top-contender-to-be-pope.php">More Info</a></td></tr>' + 
                    '<tr><td>Leonardo Sandri</td><td class="country">Argentina</td><td class="external"><a href="http://talkingpointsmemo.com/news/argentina-pope-candidates.php">More Info</a></td></tr>' + 
                    '<tr><td>Andres Maradiaga</td><td class="country">Honduras</td><td class="external"><a href="http://talkingpointsmemo.com/news/honduran-cardinal-pope-candidate.php">More Info</a></td></tr>' + 
                    '<tr><td>Timothy Dolan</td><td class="country">New York</td><td class="external"><a href="http://talkingpointsmemo.com/news/timothy-dolan-pope-contender.php">More Info</a></td></tr>' + 
                    '<tr><td>Christoph Schoenborn</td><td class="country">Austria</td><td class="external"><a href="http://talkingpointsmemo.com/news/christoph-schoenborn-papal-contender.php">More Info</a></td></tr>' + 
                    '<tr><td>Gianfranco Ravasi</td><td class="country">Vatican</td><td class="external"><a href="http://talkingpointsmemo.com/news/gianfranco-ravasi-papal-contender.php">More Info</a></td></tr>' + 
                    "</table>" + 
                    "<div class=\"close\" onclick=\"n3.timeline.switchScene('overview')\">x</div>")
                .pos([700, 8])
                .attr('id', 'label_1364624771223')
                .attr('class', 'annotation')
                .style('width', '275px'))