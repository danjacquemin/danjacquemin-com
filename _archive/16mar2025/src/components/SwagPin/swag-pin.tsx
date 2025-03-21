import { useState } from "react";

import styles from "./swag-pin.module.css";

import logoShow from "./img/logo-dave-tim-2025.png";
// import logoDave from "./img/dave.jpg";
import albumAwayFromTheWorld from "./img/album-away-from-the-world.jpg";
import albumBigWhiskey from "./img/album-big-whiskey.jpg";
import albumBustedStuff from "./img/album-busted-stuff.jpg";
import albumComeTomorrow from "./img/album-come-tomorrow.jpg";
import albumCrash from "./img/album-crash.png";
import albumCrowdedStreets from "./img/album-crowded-streets.jpg";
import albumEveryday from "./img/album-everyday.jpg";
import albumSomeDevil from "./img/album-some-devil.png";
import albumStandUp from "./img/album-stand-up.jpg";
import albumUnderTheTable from "./img/album-under-the-table.jpg";
import albumsWalkAroundTheMoon from "./img/album-walk-around-the-moon.png";

interface Album {
  name: string;
  src: string;
  lyrics?: string[];
}

const albumList: Album[] = [
  {
    name: "Under The Table And Dreaming",
    src: albumUnderTheTable,
    lyrics: [
      "You and me have a better time than most can dream",
      "I was there when the bear ate his head",
      "Could I have been a dancing Nancy?",
      "And I remember being small",
      "Could I love you? Could you love me?",
      "If you could keep me floating just for a while",
      "I'll  Leave all the lights on",
    ],
  },
  {
    name: "Crash",
    src: albumCrash,
    lyrics: [
      "I'm the king of the castle",
      "Sometimes it's easy to be myself",
      "I eat too much / I drink too much",
      "And know you feel the same way I do now",
      "I am the proudest monkey you've ever seen",
    ],
  },
  {
    name: "Before These Crowded Streets",
    src: albumCrowdedStreets,
    lyrics: [
      "Don't burn the day away",
      "Am I right side up or upside down",
      // "I've this creeping / Suspicion that things here are not as they seem",
      "I'll do my best for you, I do",
      "Come and relax now, put your troubles down",
    ],
  },
  {
    name: "Everyday",
    src: albumEveryday,
    lyrics: [
      "I take my chances on everyday",
      "I sleep just to dream her",
      // "Stay up and make some memories here, with us now",
      "You cannot quit me so quickly",
      "I'm gonna love you / When the world ends",
    ],
  },
  {
    name: "Busted Stuff",
    src: albumBustedStuff,
    lyrics: [
      "Bartender please, fill my glass for me",
      "I am the captain of this ship",
      "Excuse me please, one more drink",
      "But I do know one thing",
    ],
  },
  {
    name: "Some Devil",
    src: albumSomeDevil,
    lyrics: ["Does that screaming come from me?"],
  },
  {
    name: "Stand Up",
    src: albumStandUp,
    lyrics: [
      "First time I saw you, you did me that way",
      "Can't catch me riding my bike down the old dirt hill,",
      "'Cause you might die trying",
    ],
  },
  {
    name: "Big Whiskey & The GrooGrux King",
    src: albumBigWhiskey,
    lyrics: ["I'll be right here lying in the hands of God"],
  },
  {
    name: "Away From The World",
    src: albumAwayFromTheWorld,
  },
  {
    name: "Come Tomorrow",
    src: albumComeTomorrow,
    lyrics: [
      "What's your name? / How do you do? / What's the game?",
      "She hypnotised me with her groove",
    ],
  },
  {
    name: "Walk Around The Moon",
    src: albumsWalkAroundTheMoon,
    lyrics: ["How could I go to bed?"],
  },
];

const SwagPin = () => {
  // const [album, setAlbum] = useState<Album>();
  const [lyrics, setLyrics] = useState<string[]>([]);
  const [selectedLyric, setSelectedLyric] = useState<string>();

  const handleSelectAlbum = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // setAlbum(albumList[parseInt(event.target.value)]);
    setLyrics(albumList[parseInt(event.target.value)].lyrics || []);
    setSelectedLyric("");
  };

  const handleSelectLyrics = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLyric(event.target.value);
  };

  return (
    <div className={styles["wrap-swag-pin"]}>
      <div className={styles["button-area"]}>
        <div className={styles["swag-panel"]}>
          <div className={styles["swag-img"]}>
            <img src={logoShow} />
          </div>
          <div
            className={`${styles["swag-content"]} ${styles["swag-top-content"]}`}
          >
            <div className={styles["hello-my-name-is"]}>
              <div className={styles["hello"]}>Hello</div>
              <div className={styles["my-name-is"]}>my name is</div>
            </div>
            <div className={styles["signature"]}></div>

            {/* <div className={styles["dave-speak"]}>
              <div>&lt;Dave-Speak&gt;</div>
              <div>Hello&hellip;</div>
              <div>&lt;/Dave-Speak&gt;</div>
            </div> */}
          </div>
        </div>
        <div className={styles["swag-panel"]}>
          {/**
           * <div className={styles["swag-img"]}>
           * {album && <img src={album.src} />}
           * </div>
           **/}
          <div
            className={`${styles["swag-content"]} ${styles["swag-bottom-content"]}`}
          >
            <div className={styles["wrap-lyric"]}>{selectedLyric}</div>
          </div>
        </div>
      </div>
      <div className={styles["wrap-lyrics"]}>
        <label htmlFor="select-album">Album</label>
        <select
          onChange={handleSelectAlbum}
          className={styles["select"]}
          id="select-album"
        >
          <option value="-1">-</option>
          {albumList.map((album, ii) => {
            return (
              <option key={album.name} value={ii}>
                {album.name}
              </option>
            );
          })}
        </select>
        <label htmlFor="select-lyrics">Lyrics</label>
        <select onChange={handleSelectLyrics} id="select-lyrics">
          <option value="-1">{lyrics.length} Choices</option>
          {lyrics.length > 0 ? (
            lyrics.map((lyric) => {
              return (
                <option key={lyric} value={lyric}>
                  {lyric}
                </option>
              );
            })
          ) : (
            <option value="-1">&mdash;</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default SwagPin;
