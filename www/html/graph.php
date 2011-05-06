    <form id="word_search_form">
        <input id="word_input" type="text" placeholder="Wort hier eingeben">
        <input id="word_submit" type="submit" value="Suchen">
        <ul id="word_suggestions"></ul>
    </form>
    <input class="graph_switch" id="personal_view_button" type="button" value="Mich zeigen" style="display:none">
    <input class="graph_switch" id="global_view_button" type="button" value="Uns zeigen" style="display:none">
    <div id="graph_notfound" style="display:none">Wort nicht gefunden.</div>
    <canvas id="graph" width="640" height="540"></canvas>
