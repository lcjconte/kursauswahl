CREATE TABLE selections (
    userid integer REFERENCES userdata(userid) ON DELETE CASCADE,
    submitted boolean DEFAULT FALSE,
    de boolean DEFAULT FALSE,
    it boolean DEFAULT FALSE,
    ia boolean DEFAULT FALSE,
    en boolean DEFAULT FALSE,
    fr boolean DEFAULT FALSE,
    la boolean DEFAULT FALSE,
    mu boolean DEFAULT FALSE,
    ku boolean DEFAULT FALSE,
    ge boolean DEFAULT FALSE,
    ek boolean DEFAULT FALSE,
    so boolean DEFAULT FALSE,
    ec boolean DEFAULT FALSE,
    et boolean DEFAULT FALSE,
    fi boolean DEFAULT FALSE,
    st boolean DEFAULT FALSE,
    ma boolean DEFAULT FALSE,
    ph boolean DEFAULT FALSE,
    bi boolean DEFAULT FALSE,
    ch boolean DEFAULT FALSE,
    cs boolean DEFAULT FALSE,
    sp boolean DEFAULT FALSE
)