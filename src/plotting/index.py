import matplotlib.pyplot as plt
import json
import random
from statistics import mean

import numpy


toPlot = {
    "Witness_UserNatureDistrib": {"title": "User Nature Distribution"},
    "Witness_FollowersDistrib": {"title": "Connection Distribution across the network"},
    "Witness_ContentVeracityDistrib": {"title": "Content veracity distribution"},
    "Witness_InitialContentReplication": {
        "title": "Initial Content Replication Distribution"
    },
    "Witness_FinalContentReplication": {
        "title": "Final Content Replication Distribution"
    },
    "Witness_InitialContentReplicationAveraged": {
        "title": "Initial Content Replication Distribution Averaged"
    },
    "Witness_FinalContentReplicationAveraged": {
        "title": "Final Content Replication Distribution Averaged"
    },
    "Witness_CaseComparisonTopConnected": {
        "title": "Top Connected User's Content Replication"
    },
    "Witness_CaseComparisonAverageConnected": {
        "title": "Average Connected User's Content Replication"
    },
    "Witness_CaseComparisonLessConnected": {
        "title": "Less Connected User's Content Replication"
    },
    "Scored_ContentVeracityDistrib": {
        "title": "Content veracity distribution (Scored)"
    },
    "Scored_FollowersDistrib": {
        "title": "Connection Distribution across the network (Scored)"
    },
    "Scored_InitialContentReplication": {
        "title": "Initial Content Replication Distribution (Scored)"
    },
    "Scored_FinalContentReplication": {
        "title": "Final Content Replication Distribution (Scored)"
    },
    "Scored_UserNatureDistrib": {"title": "User Nature Distribution (Scored)"},
    "Scored_InitialContentReplicationAveraged": {
        "title": "Initial Content Replication Distribution Averaged (Scored)"
    },
    "Scored_FinalContentReplicationAveraged": {
        "title": "Final Content Replication Distribution Averaged (Scored) "
    },
    "Scored_CaseComparisonTopConnected": {
        "title": "Top Connected User's Content Replication (Scored)"
    },
    "Scored_CaseComparisonAverageConnected": {
        "title": "Average Connected User's Content Replication (Scored)"
    },
    "Scored_CaseComparisonLessConnected": {
        "title": "Less Connected User's Content Replication (Scored)"
    },
}

first = {}
last = {}

initTopConnected = []
maliciousTopConnected = []
truthfullTopConnected = []

initAverageConnected = []
maliciousAverageConnected = []
truthfullAverageConnected = []

initLessConnected = []
maliciousLessConnected = []
truthfullLessConnected = []

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
            first = {"veracity": [], "contentReplication": [], "averages": {}}
            first["veracity"] = veracity
            first["contentReplication"] = contentReplication
            first["averages"] = averages
        if key.__contains__("Final"):
            last = {"veracity": [], "contentReplication": [], "averages": {}}
            last["veracity"] = veracity
            last["contentReplication"] = contentReplication
            last["averages"] = averages

        # PLOT EVOLUTION
        if len(first.keys()) > 0 and len(last.keys()) > 0 and key.__contains__("Final"):

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
            plt.ylabel("Average content replication evolution")
            plt.title("Average evolution of the content replication by veracity")
            plt.savefig("results/" + key + "Evolution.png")

    # WORST / BEST CASE SCENARIO
    if key.__contains__("CaseComparison"):

        if key.__contains__("CaseComparisonTopConnected"):
            initTopConnected = []
            maliciousTopConnected = []
            truthfullTopConnected = []
            for ctRep in obj[0]["data"]:
                initTopConnected.append(ctRep["contentReplication"])
            for ctRep in obj[1]["data"]:
                maliciousTopConnected.append(ctRep["contentReplication"])
            for ctRep in obj[2]["data"]:
                truthfullTopConnected.append(ctRep["contentReplication"])

        if key.__contains__("CaseComparisonAverageConnected"):
            initAverageConnected = []
            maliciousAverageConnected = []
            truthfullAverageConnected = []
            for ctRep in obj[0]["data"]:
                initAverageConnected.append(ctRep["contentReplication"])
            for ctRep in obj[1]["data"]:
                maliciousAverageConnected.append(ctRep["contentReplication"])
            for ctRep in obj[2]["data"]:
                truthfullAverageConnected.append(ctRep["contentReplication"])

        if key.__contains__("CaseComparisonLessConnected"):
            initLessConnected = []
            maliciousLessConnected = []
            truthfullLessConnected = []
            for ctRep in obj[0]["data"]:
                initLessConnected.append(ctRep["contentReplication"])
            for ctRep in obj[0]["data"]:
                maliciousLessConnected.append(ctRep["contentReplication"])
            for ctRep in obj[0]["data"]:
                truthfullLessConnected.append(ctRep["contentReplication"])

        if (
            len(initTopConnected) > 0
            and len(initAverageConnected) > 0
            and len(initLessConnected) > 0
            and len(maliciousTopConnected) > 0
            and len(maliciousAverageConnected) > 0
            and len(maliciousLessConnected) > 0
            and len(truthfullTopConnected) > 0
            and len(truthfullAverageConnected) > 0
            and len(truthfullLessConnected) > 0
            and (key.__contains__("LessConnected"))
        ):
            initTopConnected = numpy.array(initTopConnected)
            maliciousTopConnected = numpy.array(maliciousTopConnected)
            truthfullTopConnected = numpy.array(truthfullTopConnected)
            initAverageConnected = numpy.array(initAverageConnected)
            maliciousAverageConnected = numpy.array(maliciousAverageConnected)
            truthfullAverageConnected = numpy.array(truthfullAverageConnected)
            initLessConnected = numpy.array(initLessConnected)
            maliciousLessConnected = numpy.array(maliciousLessConnected)
            truthfullLessConnected = numpy.array(truthfullLessConnected)

            plt.close("all")

            fig = plt.figure(figsize=(15, 5))
            ax = fig.add_subplot()

            bp = ax.boxplot(
                [
                    initTopConnected,
                    maliciousTopConnected,
                    truthfullTopConnected,
                    initAverageConnected,
                    maliciousAverageConnected,
                    truthfullAverageConnected,
                    initLessConnected,
                    maliciousLessConnected,
                    truthfullLessConnected,
                ],
                patch_artist=True,
                vert=0,
            )
            plt.xscale("log")

            ax.set_yticklabels(
                [
                    "Top Connected\nInitial Content Replication",
                    "Top Connected\nMalicious User",
                    "Top Connected\nTruthfull User",
                    "Average Connected\nInitial Content Replication",
                    "Average Connected\nMalicious User",
                    "Average Connected\nTruthfull User",
                    "Less Connected\nInitial Content Replication",
                    "Less Connected\nMalicious User",
                    "Less Connected\nTruthfull User",
                ]
            )
            ax.get_xaxis().tick_bottom()
            ax.get_yaxis().tick_left()

            plt.xlabel("Content Replication over the Network")
            plt.title("Worst and best case Scenario comparison")

            plt.savefig("results/" + key + ".png")
