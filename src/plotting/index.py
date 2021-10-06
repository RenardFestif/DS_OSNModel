import matplotlib.pyplot as plt
import json
import random
from statistics import mean


toPlot = {
    "Witness_UserNatureDistrib": {
        "title": "User Nature Distribution",
        "plotType": "pie",
    },
    "Witness_FollowersDistrib": {
        "title": "Connection Distribution across the network",
        "plotType": "bar",
    },
    "Witness_ContentVeracityDistrib": {
        "title": "Content veracity distribution",
        "plotType": "continuous",
    },
    "Witness_InitialContentReplication": {
        "title": "Initial Content Replication Distribution",
        "plotType": "continuous",
    },
    "Witness_FinalContentReplication": {
        "title": "Final Content Replication Distribution",
        "plotType": "continuous",
    },
}

first = {"veracity": [], "contentReplication": [], "averages": {}}
last = {"veracity": [], "contentReplication": [], "averages": {}}

for (key, value) in toPlot.items():

    with open("results/" + key + ".json", "r") as myfile:
        data = myfile.read()

    obj = json.loads(data)

    # USER NATURE DISTRIB
    if key.__contains__("UserNatureDistrib"):
        x = obj.values()
        dataNames = obj.keys()
        explode = [0.05, 0.2, 0.05]

        plt.close("all")

        plt.figure(figsize=(5, 5))
        plt.pie(x, explode=explode, labels=dataNames, autopct="%.2f%%")
        plt.title(value["title"])
        plt.savefig("results/" + key + ".png")

    # FOLLOWERS DISTRIB
    if key.__contains__("FollowersDistrib"):

        x = obj["nbFollowers"]
        users = [i for i in range(len(obj["nbFollowers"]))]

        plt.close("all")

        plt.bar(users, x)
        plt.xlabel("User registered on the OSN")
        plt.ylabel("Number of users following x")
        plt.title(value["title"])
        plt.grid(True)
        plt.savefig("results/" + key + ".png")

    # CONTENT VERACITY
    if key.__contains__("ContentVeracityDistrib"):

        malicious = obj["malicious"]
        average = obj["average"]
        truthfull = obj["truthfull"]

        sample = 10

        plt.close("all")
        plt.plot(
            [i for i in range(sample)],
            random.sample(malicious, sample),
            label='"Malicious" profile',
        )
        plt.plot(
            [i for i in range(sample)],
            random.sample(average, sample),
            label='"Average" profile',
        )
        plt.plot(
            [i for i in range(sample)],
            random.sample(truthfull, sample),
            label='"Truthfull" profile',
        )

        plt.xlabel(
            "sample of " + str(sample) + " contents uniformely randomly selected"
        )
        plt.ylabel("Content Veracity in %")
        plt.title(value["title"])
        plt.legend(loc="lower right")
        plt.grid(True)

        plt.savefig("results/" + key + ".png")

    # CONTENT REPLICATION
    if key.__contains__("ContentReplication"):
        veracity = []
        contentReplication = []
        totalUser = obj["totalUsers"]
        # Section average

        averages = {
            "dangerous": [],
            "false": [],
            "mixed": [],
            "true": [],
            "verified": [],
        }

        for entry in obj["data"]:
            veracity.append(entry["veracity"])
            contentReplication.append((entry["contentReplication"] / totalUser) * 100)
            if entry["veracity"] < 20:
                averages["dangerous"].append(entry["contentReplication"])
            elif entry["veracity"] >= 20 and entry["veracity"] < 40:
                averages["false"].append(entry["contentReplication"])
            elif entry["veracity"] >= 40 and entry["veracity"] < 60:
                averages["mixed"].append(entry["contentReplication"])
            elif entry["veracity"] >= 60 and entry["veracity"] < 80:
                averages["true"].append(entry["contentReplication"])
            else:
                averages["verified"].append(entry["contentReplication"])

        for section in averages:
            averages[section] = mean(averages[section])

        plt.close("all")

        fig, ax = plt.subplots()
        plt.grid(True)

        axes = plt.gca()
        axes.set_ylim([0, 30])

        ax.bar(veracity, contentReplication)
        ax.bar(
            [10, 30, 50, 70, 90],
            averages.values(),
            20,
            alpha=0.5,
            align="center",
        )

        plt.xlabel("Percentage of veracity")
        plt.ylabel("Average content replication")
        plt.title("Average content replication by veracity")
        plt.savefig("results/" + key + ".png")

        if key.__contains__("Initial"):
            first["veracity"] = veracity
            first["contentReplication"] = contentReplication
            first["averages"] = averages
        if key.__contains__("Final"):
            last["veracity"] = veracity
            last["contentReplication"] = contentReplication
            last["averages"] = averages

        # PLOT EVOLUTION
        if len(first["veracity"]) > 0 and len(last["veracity"]) > 0:

            veracity = first["veracity"]

            contentRepEvolution = []
            averageEvolution = {
                "dangerous": [],
                "false": [],
                "mixed": [],
                "true": [],
                "verified": [],
            }

            for i in range(len(first["contentReplication"])):
                diff = last["contentReplication"][i] - first["contentReplication"][i]

                contentRepEvolution.append(diff)

                if veracity[i] < 20:
                    averageEvolution["dangerous"].append((diff / totalUser) * 100)
                elif veracity[i] >= 20 and veracity[i] < 40:
                    averageEvolution["false"].append(diff)
                elif veracity[i] >= 40 and veracity[i] < 60:
                    averageEvolution["mixed"].append(diff)
                elif veracity[i] >= 60 and veracity[i] < 80:
                    averageEvolution["true"].append(diff)
                else:
                    averageEvolution["verified"].append(diff)

            for section in averageEvolution:
                averageEvolution[section] = mean(averageEvolution[section])

            plt.close("all")

            fig, ax = plt.subplots()
            plt.grid(True)

            ax.bar(veracity, contentRepEvolution)
            ax.bar(
                [10, 30, 50, 70, 90],
                averageEvolution.values(),
                20,
                alpha=0.5,
                align="center",
            )

            plt.xlabel("Percentage of veracity")
            plt.ylabel("Average content replication")
            plt.title("Average content replication by veracity")
            plt.show()
